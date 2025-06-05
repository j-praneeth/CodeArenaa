
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Home, 
  BookOpen, 
  Trophy, 
  BarChart3, 
  Settings, 
  Menu,
  Users
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Problems", href: "/problems", icon: BookOpen },
  { name: "Contests", href: "/contests", icon: Trophy },
  { name: "Leaderboard", href: "/leaderboard", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

const adminNavigation = [
  { name: "Admin Panel", href: "/admin", icon: Users },
];

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const allNavigation = isAdmin ? [...navigation, ...adminNavigation] : navigation;

  return (
    <div className={cn("pb-12 min-h-screen", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            CodeArena
          </h2>
          <div className="space-y-1">
            {allNavigation.map((item) => (
              <Button
                key={item.name}
                variant={location.pathname === item.href ? "secondary" : "ghost"}
                className="w-full justify-start"
                asChild
              >
                <Link to={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface MobileSidebarProps {
  className?: string;
}

function MobileSidebar({ className }: MobileSidebarProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className={className}>
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0">
        <ScrollArea className="my-4 h-[calc(100vh-80px)] pb-10 pl-6">
          <Sidebar />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

export { Sidebar, MobileSidebar };
export default Sidebar;
