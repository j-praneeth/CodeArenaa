import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: any
): Promise<Response> {
  const token = localStorage.getItem('token');
  
  const config: RequestInit = {
    method: method.toUpperCase(),
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    },
    credentials: "include"
  };

  if (data && method.toUpperCase() !== "GET") {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, config);
    return response;
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const token = localStorage.getItem('token');
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
      headers: {
        "Accept": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      }
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 0,
      retry: 1,
      retryDelay: 1000,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});