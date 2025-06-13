import { Navigation } from "./navigation";
import { Sidebar } from "./sidebar";
import { useAuth } from "@/hooks/useAuth";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <div className="relative">
        <Sidebar />
        <main className="pt-4 overflow-auto transition-all duration-300 ease-in-out">
          {children}
        </main>
      </div>
    </div>
  );
} 