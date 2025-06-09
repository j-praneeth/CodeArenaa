import { useQuery, useQueryClient } from "@tanstack/react-query";
import { endpoints, config } from "@/config";
import { useLocation } from "wouter";
import { useCallback } from "react";

export function useAuth() {
  const token = localStorage.getItem('token');
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      if (!token) {
        return null;
      }
      
      try {
        const response = await fetch(endpoints.user, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return null;
          }
          throw new Error('Failed to fetch user');
        }

        const userData = await response.json();
        // Cache the user data
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
      } catch (error) {
        console.error('Auth error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return null;
      }
    },
    retry: false, // Disable retries
    staleTime: 300000, // 5 minutes
    gcTime: 3600000, // 1 hour
    refetchOnWindowFocus: false, // Disable refetch on window focus
    refetchOnReconnect: false, // Disable refetch on reconnect
  });

  const logout = useCallback(async () => {
    try {
      if (token) {
        await fetch(`${config.apiUrl}/api/auth/logout`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Clear React Query cache
      queryClient.clear();
      
      // Redirect to login
      setLocation('/login');
    }
  }, [token, queryClient, setLocation]);

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user && !!token,
    logout,
  };
}
