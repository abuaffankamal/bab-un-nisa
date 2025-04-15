import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useClients } from "@/hooks/useClients";
import { useMeetings } from "@/hooks/useMeetings";
import { Meeting } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface MeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingMeeting?: Meeting | null;
}

export default function MeetingDialog({
  open,
  onOpenChange,
  existingMeeting = null
}: MeetingDialogProps) {
  const { clients } = useClients();
  const { createMeeting, updateMeeting } = useMeetings();
  const { toast } = useToast();
  
  // Meeting form state
  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState("1 hour");
  const [details, setDetails] = useState("");
  const [sendReminder, setSendReminder] = useState(false);
  const [reminderTime, setReminderTime] = useState("30 minutes before");
  
  // Reset form when opening/closing
  useEffect(() => {
    if (open) {
      if (existingMeeting) {
        // Fill form with existing meeting data
        setTitle(existingMeeting.title);
        setClientId(String(existingMeeting.clientId));
        setLocation(existingMeeting.location || "");
        setDate(format(new Date(existingMeeting.date), "yyyy-MM-dd"));
        setStartTime(existingMeeting.startTime);
        setDuration(existingMeeting.duration);
        setDetails(existingMeeting.details || "");
        setSendReminder(existingMeeting.sendReminder);
        setReminderTime(existingMeeting.reminderTime || "30 minutes before");
      } else {
        // Default values for new meeting
        setTitle("");
        setClientId(clients.length > 0 ? String(clients[0].id) : "");
        setLocation("");
        setDate(format(new Date(), "yyyy-MM-dd"));
        setStartTime("09:00");
        setDuration("1 hour");
        setDetails("");
        setSendReminder(false);
        setReminderTime("30 minutes before");
      }
    }
  }, [open, existingMeeting, clients]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !clientId || !date || !startTime || !duration) {
      toast({
        title: "Missing fields",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const meetingData = {
        title,
        date: new Date(date),
        startTime,
        duration,
        location,
        details,
        status: "scheduled",
        clientId: parseInt(clientId),
        userId: 1, // In a real app, this would be the current user's ID
        sendReminder,
        reminderTime: sendReminder ? reminderTime : null
      };
      
      if (existingMeeting) {
        await updateMeeting(existingMeeting.id, meetingData);
        toast({
          title: "Meeting updated",
          description: "The meeting has been updated successfully"
        });
      } else {
        await createMeeting(meetingData);
        toast({
          title: "Meeting created",
          description: "The meeting has been created successfully"
        });
      }
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem saving the meeting",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{existingMeeting ? "Edit Meeting" : "Add New Meeting"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Meeting Title</Label>
            <Input
              id="title"
              placeholder="e.g., Property Viewing, Contract Signing"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client">Client</Label>
              <select
                id="client"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select a client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.firstName} {client.lastName}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Address or Meeting Place"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="time">Start Time</Label>
              <Input
                id="time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="duration">Duration</Label>
              <select
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="30 minutes">30 minutes</option>
                <option value="45 minutes">45 minutes</option>
                <option value="1 hour">1 hour</option>
                <option value="1.5 hours">1.5 hours</option>
                <option value="2 hours">2 hours</option>
              </select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="details">Meeting Details</Label>
            <Textarea
              id="details"
              placeholder="Add any important details about this meeting"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="mt-1 h-24"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sendReminder"
                checked={sendReminder}
                onCheckedChange={(checked) => setSendReminder(checked as boolean)}
              />
              <Label htmlFor="sendReminder" className="text-sm">Send reminder</Label>
            </div>
            
            <select
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              disabled={!sendReminder}
              className="text-sm border border-gray-300 rounded-md px-2 py-1"
            >
              <option value="30 minutes before">30 minutes before</option>
              <option value="1 hour before">1 hour before</option>
              <option value="3 hours before">3 hours before</option>
              <option value="1 day before">1 day before</option>
            </select>
          </div>
          
          <DialogFooter className="mt-6 flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {existingMeeting ? "Update Meeting" : "Create Meeting"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
