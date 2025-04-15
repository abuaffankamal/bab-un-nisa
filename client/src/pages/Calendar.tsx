import { useState } from "react";
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useMeetings } from "@/hooks/useMeetings";
import MeetingDialog from "@/components/meetings/MeetingDialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Meeting } from "@shared/schema";
import { getColorForStatus } from "@/lib/utils";

import enUS from "date-fns/locale/en-US";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function Calendar() {
  const [isAddMeetingOpen, setIsAddMeetingOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [view, setView] = useState("month");
  const { meetings, isLoading } = useMeetings();
  
  const events = meetings.map((meeting) => {
    const startDate = new Date(meeting.date);
    const [hours, minutes] = meeting.startTime.split(":").map(Number);
    startDate.setHours(hours, minutes, 0);
    
    // Calculate end date based on duration
    const endDate = new Date(startDate);
    const durationMatch = meeting.duration.match(/(\d+(?:\.\d+)?)\s*(hour|hours|min|minutes)/);
    
    if (durationMatch) {
      const value = parseFloat(durationMatch[1]);
      const unit = durationMatch[2];
      
      if (unit.includes("hour")) {
        endDate.setHours(endDate.getHours() + value);
      } else if (unit.includes("min")) {
        endDate.setMinutes(endDate.getMinutes() + value);
      }
    } else {
      // Default to 1 hour if parsing fails
      endDate.setHours(endDate.getHours() + 1);
    }
    
    return {
      id: meeting.id,
      title: meeting.title,
      start: startDate,
      end: endDate,
      status: meeting.status,
      client: meeting.clientId,
      allDay: false
    };
  });
  
  const handleSelectEvent = (event: any) => {
    const meeting = meetings.find(m => m.id === event.id);
    if (meeting) {
      setSelectedMeeting(meeting);
      setIsAddMeetingOpen(true);
    }
  };
  
  const handleSelectSlot = ({ start }: { start: Date }) => {
    // Prepare a new meeting at the selected time
    setSelectedMeeting(null);
    setIsAddMeetingOpen(true);
  };

  const eventStyleGetter = (event: any) => {
    const style = {
      backgroundColor: getColorForStatus(event.status),
      borderRadius: '4px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block'
    };
    return {
      style
    };
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Calendar</h2>
        
        <div className="mt-4 md:mt-0 flex items-center space-x-2">
          <Select value={view} onValueChange={setView}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="View" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="agenda">Agenda</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            onClick={() => {
              setSelectedMeeting(null);
              setIsAddMeetingOpen(true);
            }}
            className="bg-orange-400 hover:bg-orange-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Meeting
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Meeting Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-[600px] flex items-center justify-center">
              <p>Loading calendar...</p>
            </div>
          ) : (
            <div className="h-[600px]">
              <BigCalendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                selectable
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleSelectSlot}
                view={view as any}
                onView={(newView) => setView(newView)}
                eventPropGetter={eventStyleGetter}
              />
            </div>
          )}
        </CardContent>
      </Card>
      
      <MeetingDialog 
        open={isAddMeetingOpen} 
        onOpenChange={setIsAddMeetingOpen} 
        existingMeeting={selectedMeeting}
      />
    </div>
  );
}
