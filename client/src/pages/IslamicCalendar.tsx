import { useState, useEffect } from 'react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, MoonStarIcon, StarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Using 'hijri' library to convert dates
// Using the hijri-date library for date conversion
import HijriDate from 'hijri-date';

// Custom type for Islamic events
interface IslamicEvent {
  id: number;
  title: string;
  description: string;
  hijriDate: string; // Format: "DD-MM" (day-month)
  type: 'holiday' | 'observance' | 'other';
}

export default function IslamicCalendar() {
  const [gregorianDate, setGregorianDate] = useState<Date | undefined>(new Date());
  const [hijriDate, setHijriDate] = useState<{ year: number; month: number; day: number }>();
  const [activeTab, setActiveTab] = useState('gregorian');
  const [islamicEvents, setIslamicEvents] = useState<IslamicEvent[]>([]);
  const [monthEvents, setMonthEvents] = useState<IslamicEvent[]>([]);
  const { toast } = useToast();

  // Islamic events list (simplified, would be expanded in a complete app)
  const allIslamicEvents: IslamicEvent[] = [
    {
      id: 1,
      title: 'Islamic New Year',
      description: 'The beginning of the Islamic Hijri year, marking the Prophet Muhammad\'s migration from Mecca to Medina.',
      hijriDate: '01-01', // 1st of Muharram
      type: 'holiday'
    },
    {
      id: 2,
      title: 'Day of Ashura',
      description: 'Commemorates the day Noah left the Ark and Moses was saved from the Pharaoh. Many Muslims fast on this day.',
      hijriDate: '10-01', // 10th of Muharram
      type: 'observance'
    },
    {
      id: 3,
      title: 'Mawlid al-Nabi',
      description: 'Celebrates the birthday of Prophet Muhammad.',
      hijriDate: '12-03', // 12th of Rabi al-Awwal
      type: 'observance'
    },
    {
      id: 4,
      title: 'Beginning of Ramadan',
      description: 'The start of the holy month of Ramadan, when Muslims fast from dawn until sunset.',
      hijriDate: '01-09', // 1st of Ramadan
      type: 'holiday'
    },
    {
      id: 5,
      title: 'Laylat al-Qadr',
      description: 'The Night of Power, when the first verses of the Quran were revealed to Prophet Muhammad.',
      hijriDate: '27-09', // 27th of Ramadan (most commonly observed date)
      type: 'observance'
    },
    {
      id: 6,
      title: 'Eid al-Fitr',
      description: 'Festival of Breaking the Fast, celebrated at the end of Ramadan.',
      hijriDate: '01-10', // 1st of Shawwal
      type: 'holiday'
    },
    {
      id: 7,
      title: 'Day of Arafah',
      description: 'The day when pilgrims gather on Mount Arafah during Hajj. Many Muslims fast on this day.',
      hijriDate: '09-12', // 9th of Dhul-Hijjah
      type: 'observance'
    },
    {
      id: 8,
      title: 'Eid al-Adha',
      description: 'Festival of the Sacrifice, commemorating the willingness of Ibrahim to sacrifice his son.',
      hijriDate: '10-12', // 10th of Dhul-Hijjah
      type: 'holiday'
    }
  ];

  // Hijri month names
  const hijriMonths = [
    'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
    'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Sha\'ban',
    'Ramadan', 'Shawwal', 'Dhu al-Qidah', 'Dhu al-Hijjah'
  ];

  // Update Hijri date when Gregorian date changes
  useEffect(() => {
    if (gregorianDate) {
      try {
        // Convert Gregorian date to Hijri using the hijri-date library
        const hijriDate = new HijriDate(gregorianDate);
        setHijriDate({
          year: hijriDate.getFullYear(),
          month: hijriDate.getMonth(),
          day: hijriDate.getDate()
        });
      } catch (error) {
        console.error('Error converting to Hijri date:', error);
      }
    }
  }, [gregorianDate]);

  // Get Islamic events for the current Hijri month
  useEffect(() => {
    if (hijriDate) {
      const currentMonthEvents = allIslamicEvents.filter(event => {
        const [eventDay, eventMonth] = event.hijriDate.split('-').map(Number);
        return eventMonth === hijriDate.month;
      });
      
      setMonthEvents(currentMonthEvents);
    }
  }, [hijriDate]);

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    setGregorianDate(date);
    
    // Check if the selected date has any Islamic events
    if (date && hijriDate) {
      const selectedDateEvents = allIslamicEvents.filter(event => {
        const [eventDay, eventMonth] = event.hijriDate.split('-').map(Number);
        return eventDay === hijriDate.day && eventMonth === hijriDate.month;
      });
      
      if (selectedDateEvents.length > 0) {
        // Show toast for events on this day
        selectedDateEvents.forEach(event => {
          toast({
            title: event.title,
            description: event.description,
            variant: 'default'
          });
        });
      }
    }
  };

  // Get badge color based on event type
  const getEventBadgeColor = (type: string) => {
    switch (type) {
      case 'holiday':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'observance':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Islamic Calendar</h1>
      
      <Tabs defaultValue="gregorian" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-6">
          <TabsTrigger value="gregorian">Gregorian Calendar</TabsTrigger>
          <TabsTrigger value="hijri">Hijri Calendar</TabsTrigger>
        </TabsList>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <TabsContent value="gregorian" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CalendarIcon className="mr-2 h-5 w-5" />
                    Gregorian Calendar
                  </CardTitle>
                  <CardDescription>
                    {hijriDate && `Current Hijri Date: ${hijriDate.day} ${hijriMonths[hijriDate.month - 1]}, ${hijriDate.year} AH`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="p-4">
                    <CalendarComponent
                      mode="single"
                      selected={gregorianDate}
                      onSelect={handleDateSelect}
                      className="rounded-md border"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="hijri" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MoonStarIcon className="mr-2 h-5 w-5" />
                    Hijri Calendar
                  </CardTitle>
                  <CardDescription>
                    Islamic lunar calendar system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-semibold mb-2">
                      {hijriDate && `${hijriMonths[hijriDate.month - 1]} ${hijriDate.year} AH`}
                    </h2>
                    <p className="text-gray-500">
                      {gregorianDate && new Intl.DateTimeFormat('en-US', { 
                        month: 'long', 
                        year: 'numeric' 
                      }).format(gregorianDate)}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-7 text-center gap-1">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="font-medium text-sm p-2">
                        {day}
                      </div>
                    ))}
                    
                    {/* Placeholder for actual Hijri calendar grid */}
                    {/* In a complete app, this would calculate and display the Hijri month days */}
                    {Array.from({ length: 30 }, (_, i) => (
                      <div 
                        key={i} 
                        className={`rounded-md p-2 cursor-pointer transition-colors hover:bg-primary-50 text-sm
                          ${hijriDate?.day === i + 1 ? 'bg-primary-100 font-bold' : ''}
                        `}
                        onClick={() => console.log(`Selected Hijri day: ${i + 1}`)}
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
          
          <div className="lg:col-span-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <StarIcon className="mr-2 h-5 w-5" />
                  Important Islamic Dates
                </CardTitle>
                <CardDescription>
                  {hijriDate && `Events in ${hijriMonths[hijriDate.month - 1]}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {monthEvents.length > 0 ? (
                  monthEvents.map(event => (
                    <div key={event.id} className="border-b pb-3 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-medium">{event.title}</h3>
                        <Badge className={getEventBadgeColor(event.type)}>
                          {event.type === 'holiday' ? 'Holiday' : 'Observance'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {hijriMonths[parseInt(event.hijriDate.split('-')[1]) - 1]} {event.hijriDate.split('-')[0]}
                      </p>
                      <p className="text-sm text-gray-500">{event.description}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No major Islamic events in this month</p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => setActiveTab(activeTab === 'gregorian' ? 'hijri' : 'gregorian')}>
                  Switch to {activeTab === 'gregorian' ? 'Hijri' : 'Gregorian'} View
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </Tabs>
    </div>
  );
}