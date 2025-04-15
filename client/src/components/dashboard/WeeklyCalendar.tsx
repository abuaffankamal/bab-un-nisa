import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useMeetings } from "@/hooks/useMeetings";
import { startOfWeek, addDays, format, isSameDay } from "date-fns";

export default function WeeklyCalendar() {
  const { meetings, isLoading } = useMeetings();
  
  // Calculate the current week
  const today = new Date();
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 }); // Start week on Monday
  
  // Create array for the week days
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(startOfCurrentWeek, i);
    return {
      date,
      dayName: format(date, "EEE"),
      dayNumber: format(date, "d"),
      isToday: isSameDay(date, today)
    };
  });
  
  // Group meetings by day
  const getMeetingsForDay = (date: Date) => {
    return meetings.filter(meeting => {
      const meetingDate = new Date(meeting.date);
      return isSameDay(meetingDate, date);
    });
  };
  
  // Get color class based on meeting type (simplified for demo)
  const getMeetingColorClass = (title: string) => {
    if (title.includes("Property Viewing")) {
      return "bg-primary-100 text-primary-800";
    } else if (title.includes("Contract")) {
      return "bg-yellow-100 text-yellow-800";
    } else if (title.includes("Open House")) {
      return "bg-blue-100 text-blue-800";
    } else if (title.includes("Walkthrough") || title.includes("Inspection")) {
      return "bg-green-100 text-green-800";
    } else {
      return "bg-purple-100 text-purple-800";
    }
  };

  return (
    <Card className="border border-gray-100">
      <CardHeader className="border-b border-gray-100 p-4 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">Weekly Calendar</CardTitle>
        <Link href="/calendar">
          <Button variant="link" className="text-sm text-primary-600 hover:text-primary-800">
            View Full Calendar
          </Button>
        </Link>
      </CardHeader>
      
      <CardContent className="p-4">
        {isLoading ? (
          <div className="p-8 text-center">
            <p>Loading calendar...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-gray-500 pb-2">
              {weekDays.map((day) => (
                <div key={day.dayName}>{day.dayName}</div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-2 text-sm">
              {weekDays.map((day) => {
                const dayMeetings = getMeetingsForDay(day.date);
                
                return (
                  <div 
                    key={day.dayNumber} 
                    className={`border border-gray-200 rounded-lg calendar-day p-1 ${
                      day.isToday ? 'bg-gray-50' : ''
                    }`}
                  >
                    <div className={`text-right mb-1 font-medium ${
                      day.isToday ? 'text-primary-600' : 'text-gray-500'
                    }`}>
                      {day.dayNumber}
                    </div>
                    
                    {dayMeetings.map((meeting) => (
                      <div 
                        key={meeting.id} 
                        className={`calendar-event ${getMeetingColorClass(meeting.title)}`}
                      >
                        {meeting.startTime} - {meeting.title.length > 20 
                          ? meeting.title.substring(0, 20) + '...' 
                          : meeting.title}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
