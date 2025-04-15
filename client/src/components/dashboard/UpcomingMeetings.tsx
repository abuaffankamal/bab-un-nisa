import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useMeetings } from "@/hooks/useMeetings";
import { useClients } from "@/hooks/useClients";
import { format } from "date-fns";

export default function UpcomingMeetings() {
  const [timeFilter, setTimeFilter] = useState("today");
  const { meetings, isLoading } = useMeetings();
  const { clients } = useClients();
  
  // Filter meetings based on the selected time period
  const filteredMeetings = meetings.filter(meeting => {
    const meetingDate = new Date(meeting.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const oneWeekLater = new Date(today);
    oneWeekLater.setDate(oneWeekLater.getDate() + 7);
    
    const oneMonthLater = new Date(today);
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
    
    if (timeFilter === "today") {
      return meetingDate.toDateString() === today.toDateString();
    } else if (timeFilter === "week") {
      return meetingDate >= today && meetingDate < oneWeekLater;
    } else {
      return meetingDate >= today && meetingDate < oneMonthLater;
    }
  });
  
  // Sort by date and time
  const sortedMeetings = [...filteredMeetings].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    if (dateA.toDateString() !== dateB.toDateString()) {
      return dateA.getTime() - dateB.getTime();
    }
    return a.startTime.localeCompare(b.startTime);
  });
  
  // Get client name by ID
  const getClientName = (clientId: number) => {
    const client = clients.find(c => c.id === clientId);
    return client ? `${client.firstName} ${client.lastName}` : "Unknown Client";
  };
  
  // Get badge style based on meeting status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
      case "scheduled":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-200">Confirmed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200">Pending</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-200">Cancelled</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">Completed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200">{status}</Badge>;
    }
  };
  
  // Format date for display
  const formatDate = (date: Date) => {
    const month = format(date, "MMM").toUpperCase();
    const day = format(date, "d");
    return { month, day };
  };

  return (
    <Card className="border border-gray-100">
      <CardHeader className="border-b border-gray-100 p-4 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">Upcoming Meetings</CardTitle>
        <div className="flex items-center space-x-2">
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="link" size="sm" className="text-primary-600 hover:text-primary-800">
            View All
          </Button>
        </div>
      </CardHeader>
      
      <div className="divide-y divide-gray-100">
        {isLoading ? (
          <div className="p-8 text-center">
            <p>Loading meetings...</p>
          </div>
        ) : sortedMeetings.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No meetings scheduled for this period</p>
          </div>
        ) : (
          sortedMeetings.map((meeting) => {
            const meetingDate = new Date(meeting.date);
            const { month, day } = formatDate(meetingDate);
            
            return (
              <div key={meeting.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start">
                  <div className="bg-primary-100 text-primary-700 rounded-lg p-2 text-center mr-4 w-12">
                    <div className="text-xs font-medium">{month}</div>
                    <div className="text-lg font-bold">{day}</div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{meeting.title}</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          <span>{meeting.startTime}</span> - 
                          <span> {meeting.duration}</span> • 
                          <span> {getClientName(meeting.clientId)}</span>
                        </p>
                      </div>
                      <div className="flex">
                        {getStatusBadge(meeting.status)}
                      </div>
                    </div>
                    
                    <div className="flex items-center mt-3 space-x-3">
                      <Button variant="ghost" size="sm" className="text-xs flex items-center text-gray-500 hover:text-gray-700 p-0 h-auto">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-3 w-3 mr-1" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                          <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                        Send Reminder
                      </Button>
                      <Button variant="ghost" size="sm" className="text-xs flex items-center text-gray-500 hover:text-gray-700 p-0 h-auto">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-3 w-3 mr-1" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        Directions
                      </Button>
                      <Button variant="ghost" size="sm" className="text-xs flex items-center text-gray-500 hover:text-gray-700 p-0 h-auto">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-3 w-3 mr-1" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                          <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                        Meeting Details
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      <div className="p-4 border-t border-gray-100 text-center">
        <Button variant="link" className="text-primary-600 text-sm hover:text-primary-800">
          View All Meetings
        </Button>
      </div>
    </Card>
  );
}
