import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  url: string,
  method: string,
  data?: unknown | undefined,
): Promise<Response> {
  try {
    console.log(`[DEBUG] Making ${method} request to ${url}`, data);
    const token = localStorage.getItem('token');
    const res = await fetch(url, {
      method,
      headers: {
        ...(data ? { "Content-Type": "application/json" } : {}),
        "Accept": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    console.log(`[DEBUG] Response status: ${res.status}`);
    
    // Try to parse error response as JSON first
    if (!res.ok) {
      let errorMessage: string;
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorData.error || res.statusText;
        if (errorData.errors) {
          console.error('[DEBUG] Validation errors:', errorData.errors);
          errorMessage += '\n' + JSON.stringify(errorData.errors);
        }
      } catch {
        // If JSON parsing fails, fall back to text
        errorMessage = await res.text() || res.statusText;
      }
      console.error(`[DEBUG] API error: ${errorMessage}`);
      throw new Error(errorMessage);
    }

    return res;
  } catch (error) {
    console.error('[DEBUG] API request error:', error);
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
