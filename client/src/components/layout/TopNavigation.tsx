import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Bell, HelpCircle, Sun, Moon, LogOut, User } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { useTheme } from "@/hooks/useTheme";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function TopNavigation() {
  const { user } = useUser();
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    await logout();
    setLocation('/auth');
  };

  return (
    <header className="bg-card dark:bg-gray-800 shadow-sm border-b border-border">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center md:hidden">
          <h1 className="text-xl font-bold text-primary">Bab-un-Nisa</h1>
        </div>
        
        <div className="flex items-center flex-1 md:flex-initial justify-end">
          {user && (
            <div className="relative mx-4 md:w-64">
              <Input
                type="text"
                placeholder="Search Quran, Hadith, or topics..."
                className="w-full pl-10 pr-4 py-2 bg-background dark:bg-gray-700"
              />
              <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
            </div>
          )}
          
          <div className="flex items-center space-x-3">
            {/* Prayer time notification - visible to all */}
            <Button variant="ghost" size="icon" className="relative hover:bg-green-100 dark:hover:bg-green-900" asChild>
              <Link href="/prayer-times">
                <Bell className="h-5 w-5 text-primary" />
                <Badge 
                  className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-4 h-4 p-0 flex items-center justify-center"
                >
                  1
                </Badge>
              </Link>
            </Button>
            
            {/* Ask a question - visible to all */}
            <Button variant="ghost" size="icon" className="hover:bg-green-100 dark:hover:bg-green-900" asChild>
              <Link href="/ask">
                <HelpCircle className="h-5 w-5 text-primary" />
              </Link>
            </Button>
            
            {/* Theme toggle - visible to all */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              className="hover:bg-green-100 dark:hover:bg-green-900"
            >
              {theme === 'dark' ? (
                <Moon className="h-5 w-5 text-primary" />
              ) : (
                <Sun className="h-5 w-5 text-primary" />
              )}
            </Button>

            {user ? (
              /* Logout button - only for authenticated users */
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleLogout}
                className="hover:bg-green-100 dark:hover:bg-green-900"
                title="Logout"
              >
                <LogOut className="h-5 w-5 text-primary" />
              </Button>
            ) : (
              /* Sign in button - only for unauthenticated users */
              <Button 
                variant="ghost" 
                size="icon" 
                className="hover:bg-green-100 dark:hover:bg-green-900"
                asChild
              >
                <Link href="/auth">
                  <User className="h-5 w-5 text-primary" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
