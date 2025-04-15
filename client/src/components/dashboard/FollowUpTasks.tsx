import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MoreHorizontal } from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import { useClients } from "@/hooks/useClients";
import TaskItem from "@/components/tasks/TaskItem";
import { format, isToday, isTomorrow } from "date-fns";

export default function FollowUpTasks() {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const { tasks, createTask, isLoading } = useTasks();
  const { clients } = useClients();
  
  // Get only pending tasks
  const pendingTasks = tasks.filter(task => !task.completed);
  
  // Sort tasks by priority and due date
  const sortedTasks = [...pendingTasks].sort((a, b) => {
    const priorityOrder: Record<string, number> = {
      urgent: 0,
      high: 1,
      medium: 2,
      low: 3
    };
    
    // First sort by priority
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    
    // Then sort by due date
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
  
  // Get client name by ID
  const getClientName = (clientId: number) => {
    const client = clients.find(c => c.id === clientId);
    return client ? `${client.firstName} ${client.lastName}` : "Unknown Client";
  };
  
  // Format due date for display
  const formatDueDate = (date: Date) => {
    if (isToday(date)) {
      return "Today";
    } else if (isTomorrow(date)) {
      return "Tomorrow";
    } else {
      return format(date, "MMM d");
    }
  };
  
  // Handle create new task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTaskTitle.trim()) return;
    
    // For simplicity, we'll create a task for the first client
    // In a real app, you'd have a dropdown to select the client
    const clientId = clients.length > 0 ? clients[0].id : 1;
    
    await createTask({
      title: newTaskTitle,
      dueDate: new Date(),
      completed: false,
      priority: "medium",
      clientId,
      userId: 1,
      meetingId: null
    });
    
    setNewTaskTitle("");
  };

  return (
    <Card className="border border-gray-100">
      <CardHeader className="border-b border-gray-100 p-4">
        <CardTitle className="text-base font-semibold">Follow-up Tasks</CardTitle>
      </CardHeader>
      
      <div className="divide-y divide-gray-100">
        {isLoading ? (
          <div className="p-8 text-center">
            <p>Loading tasks...</p>
          </div>
        ) : sortedTasks.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No pending tasks</p>
          </div>
        ) : (
          sortedTasks.map((task) => (
            <TaskItem 
              key={task.id}
              task={task}
              clientName={getClientName(task.clientId)}
              formattedDueDate={formatDueDate(new Date(task.dueDate))}
            />
          ))
        )}
      </div>
      
      <CardContent className="p-4 border-t border-gray-100">
        <form onSubmit={handleCreateTask} className="flex items-center">
          <Input
            type="text"
            placeholder="Add a new task..."
            className="flex-1 text-sm"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
          />
          <Button type="submit" size="icon" className="ml-2 bg-primary-600 text-white hover:bg-primary-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
