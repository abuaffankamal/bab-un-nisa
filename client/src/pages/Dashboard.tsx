import { useState } from "react";
import StatCard from "@/components/dashboard/StatCard";
import UpcomingMeetings from "@/components/dashboard/UpcomingMeetings";
import FollowUpTasks from "@/components/dashboard/FollowUpTasks";
import BackupStatus from "@/components/dashboard/BackupStatus";
import WeeklyCalendar from "@/components/dashboard/WeeklyCalendar";
import MeetingDialog from "@/components/meetings/MeetingDialog";
import { useUser } from "@/hooks/useUser";
import { useBackups } from "@/hooks/useBackups";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [isAddMeetingOpen, setIsAddMeetingOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const { createBackup, backups } = useBackups();

  // Get stats for dashboard
  const { data: stats } = useQuery({
    queryKey: ['/api/stats'],
    queryFn: async () => {
      // For now, we'll calculate these stats from meetings and tasks
      const meetingsRes = await fetch('/api/meetings');
      const meetings = await meetingsRes.json();
      
      const tasksRes = await fetch('/api/tasks?completed=false');
      const tasks = await tasksRes.json();
      
      const clientsRes = await fetch('/api/clients');
      const clients = await clientsRes.json();
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayMeetings = meetings.filter((meeting: any) => {
        const meetingDate = new Date(meeting.date);
        meetingDate.setHours(0, 0, 0, 0);
        return meetingDate.getTime() === today.getTime();
      });
      
      return {
        todayMeetings: todayMeetings.length,
        pendingFollowups: tasks.length,
        activeClients: clients.length
      };
    }
  });

  const handleBackupNow = async () => {
    try {
      await createBackup();
      toast({
        title: "Backup Complete",
        description: "Your data has been successfully backed up.",
      });
    } catch (error) {
      toast({
        title: "Backup Failed",
        description: "There was an error creating your backup.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
          <p className="text-gray-500">Welcome back, {user?.firstName || 'User'}</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center space-x-2">
          <button 
            onClick={handleBackupNow}
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm flex items-center text-gray-700 hover:bg-gray-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
              <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
              <line x1="6" y1="6" x2="6.01" y2="6"></line>
              <line x1="6" y1="18" x2="6.01" y2="18"></line>
            </svg>
            Backup Now
          </button>
          <button 
            onClick={() => setIsAddMeetingOpen(true)}
            className="px-4 py-2 bg-orange-400 text-white rounded-lg text-sm font-medium shadow-sm hover:bg-orange-500 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Meeting
          </button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard 
          title="Today's Meetings" 
          value={stats?.todayMeetings || 0} 
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          } 
          change="+2" 
          changeText="from yesterday" 
          iconBgColor="bg-blue-100" 
          iconColor="text-primary-500" 
        />
        
        <StatCard 
          title="Pending Follow-ups" 
          value={stats?.pendingFollowups || 0} 
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          } 
          change="+3" 
          changeText="from last week" 
          changeColor="text-red-500"
          iconBgColor="bg-orange-100" 
          iconColor="text-orange-500" 
        />
        
        <StatCard 
          title="Active Clients" 
          value={stats?.activeClients || 0} 
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          } 
          change="+5" 
          changeText="this month" 
          iconBgColor="bg-green-100" 
          iconColor="text-green-500" 
        />
        
        <StatCard 
          title="Last Backup" 
          value={
            backups.length > 0 
              ? new Date(backups[0]?.timestamp).toLocaleDateString() 
              : 'Never'
          } 
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
          } 
          subText="Automatic daily at 2:00 AM" 
          iconBgColor="bg-purple-100" 
          iconColor="text-purple-500" 
        />
      </div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Meetings */}
        <div className="lg:col-span-2">
          <UpcomingMeetings />
        </div>
        
        {/* Follow-up Tasks */}
        <div className="space-y-6">
          <FollowUpTasks />
          <BackupStatus />
        </div>
      </div>
      
      {/* Weekly Calendar Preview */}
      <div className="mt-6">
        <WeeklyCalendar />
      </div>
      
      {/* Meeting Dialog */}
      <MeetingDialog open={isAddMeetingOpen} onOpenChange={setIsAddMeetingOpen} />
    </div>
  );
}
