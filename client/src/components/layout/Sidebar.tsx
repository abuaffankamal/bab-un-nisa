import { Link, useLocation } from "wouter";
import { useUser } from "@/hooks/useUser";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar, MapPin, BookOpen, Book, HelpCircle, Moon, Award, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/useTheme";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const [location, setLocation] = useLocation();
  const { user } = useUser();
  const { theme } = useTheme();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    setLocation('/auth');
  };
  
  // Public navigation items
  const publicItems = [
    {
      title: "Prayer Times",
      icon: <Calendar className="h-5 w-5" />,
      href: "/prayer-times"
    },
    {
      title: "Qibla Direction",
      icon: <MapPin className="h-5 w-5" />,
      href: "/qibla"
    }
  ];

  // Protected navigation items
  const protectedItems = [
    {
      title: "Quran",
      icon: <BookOpen className="h-5 w-5" />,
      href: "/quran"
    },
    {
      title: "Hadith",
      icon: <Book className="h-5 w-5" />,
      href: "/hadith"
    },
    {
      title: "Islamic Calendar",
      icon: <Moon className="h-5 w-5" />,
      href: "/islamic-calendar"
    },
    {
      title: "Ask a Question",
      icon: <HelpCircle className="h-5 w-5" />,
      href: "/ask"
    },
    {
      title: "Profile",
      icon: <User className="h-5 w-5" />,
      href: "/profile"
    }
  ];
  
  // Combined items for the nav
  const navItems = [...publicItems, ...(user ? protectedItems : [])];
  
  // Mobile sidebar
  const MobileSidebar = (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="left" className="w-[240px] sm:w-[300px] bg-card dark:bg-gray-800 text-card-foreground dark:text-gray-100">
        <SheetHeader>
          <SheetTitle className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
            <div>
              <div className="text-lg font-bold text-primary">Bab-un-Nisa</div>
              <div className="text-xs text-muted-foreground">Islamic Resources & Tools</div>
            </div>
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col h-full py-6">
          <nav className="flex-1">
            <ul className="space-y-1 mb-4">
              {navItems.map((item) => (
                <li key={item.title}>
                  <Link href={item.href}>
                    <div 
                      className={cn(
                        "flex items-center px-4 py-3 text-card-foreground hover:bg-green-100 dark:hover:bg-green-900 rounded-md cursor-pointer",
                        location === item.href && "bg-green-100 dark:bg-green-900 text-primary font-medium border-l-4 border-primary"
                      )}
                      onClick={() => setOpen(false)}
                    >
                      <span className={cn(
                        "mr-3",
                        location === item.href ? "text-primary" : "text-primary"
                      )}>
                        {item.icon}
                      </span>
                      {item.title}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          
          <div className="pt-4 border-t border-border dark:border-gray-700">
            <div className="px-4">
              {user ? (
                <Button 
                  onClick={handleLogout}
                  className="w-full"
                  variant="outline"
                >
                  Sign Out
                </Button>
              ) : (
                <Button 
                  asChild
                  className="w-full"
                  variant="outline"
                >
                  <Link href="/auth">Sign In</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
  
  // Desktop sidebar
  const DesktopSidebar = (
    <aside className="bg-card dark:bg-gray-800 shadow-md w-64 flex-shrink-0 hidden md:block border-r border-border dark:border-gray-700">
      <div className="flex flex-col h-full">
        <div className="px-6 py-4 border-b border-border dark:border-gray-700">
          <h1 className="text-xl font-bold text-primary flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
            Bab-un-Nisa
          </h1>
          <p className="text-xs text-muted-foreground">Islamic Resources & Tools</p>
        </div>
        
        <nav className="flex-grow py-4">
          <ul className="space-y-1 mb-4">
            {navItems.map((item) => (
              <li key={item.title}>
                <Link href={item.href}>
                  <div 
                    className={cn(
                      "sidebar-link flex items-center px-6 py-3 text-card-foreground hover:bg-green-100 dark:hover:bg-green-900 cursor-pointer",
                      location === item.href && "active bg-green-100 dark:bg-green-900 text-primary font-medium border-l-4 border-primary"
                    )}
                  >
                    <span className={cn(
                      "mr-3",
                      location === item.href ? "text-primary" : "text-primary"
                    )}>
                      {item.icon}
                    </span>
                    {item.title}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="px-6 py-4 border-t border-border dark:border-gray-700">
          {user ? (
            <Button 
              onClick={handleLogout}
              className="w-full"
              variant="outline"
            >
              Sign Out
            </Button>
          ) : (
            <Button 
              asChild
              className="w-full"
              variant="outline"
            >
              <Link href="/auth">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
  
  return (
    <>
      {DesktopSidebar}
      {MobileSidebar}
    </>
  );
}
