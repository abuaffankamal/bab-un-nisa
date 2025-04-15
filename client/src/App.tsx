import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import Sidebar from "@/components/layout/Sidebar";
import TopNavigation from "@/components/layout/TopNavigation";
import Home from "@/pages/Home";
import Quran from "@/pages/QuranEnhanced";
import Hadith from "@/pages/HadithWithAPI";
import PrayerTimes from "@/pages/PrayerTimes";
import Qibla from "@/pages/Qibla";
import Calendar from "@/pages/Calendar";
import IslamicCalendar from "@/pages/IslamicCalendar";
import Ask from "@/pages/Ask";
import LearningProgress from "@/pages/LearningProgress";
import UserProfile from "@/pages/UserProfile";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/hooks/useTheme";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/prayer-times" component={PrayerTimes} />
      <Route path="/qibla" component={Qibla} />
      <ProtectedRoute path="/quran" component={Quran} />
      <ProtectedRoute path="/hadith" component={Hadith} />
      <ProtectedRoute path="/calendar" component={Calendar} />
      <ProtectedRoute path="/islamic-calendar" component={IslamicCalendar} />
      <ProtectedRoute path="/ask" component={Ask} />
      <ProtectedRoute path="/progress" component={LearningProgress} />
      <ProtectedRoute path="/profile" component={UserProfile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {user && <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />}
      
      {/* Mobile sidebar toggle - only show for authenticated users */}
      {user && (
        <div className="fixed bottom-4 right-4 md:hidden z-50">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="bg-primary text-primary-foreground p-3 rounded-full shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      )}
      
      <main className="flex-1 overflow-y-auto dark:bg-gray-900">
        <TopNavigation />
        <Router />
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <Layout />
          <Toaster />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
