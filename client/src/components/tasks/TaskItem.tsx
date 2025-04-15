import { useState } from "react";
import { Task } from "@shared/schema";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import { cn } from "@/lib/utils";

interface TaskItemProps {
  task: Task;
  clientName: string;
  formattedDueDate: string;
}

export default function TaskItem({ task, clientName, formattedDueDate }: TaskItemProps) {
  const [isChecked, setIsChecked] = useState(task.completed);
  const { updateTask } = useTasks();
  
  // Get badge style for priority
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-200">Urgent</Badge>;
      case "high":
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200">High</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200">Medium</Badge>;
      case "low":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">Low</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200">{priority}</Badge>;
    }
  };
  
  // Handle checkbox change
  const handleCheckboxChange = async (checked: boolean) => {
    setIsChecked(checked);
    await updateTask(task.id, { completed: checked });
  };

  return (
    <div className={cn("p-4 hover:bg-gray-50", isChecked && "bg-gray-50")}>
      <div className="flex items-center">
        <Checkbox
          id={`task-${task.id}`}
          className="mr-3 h-4 w-4 text-primary-600 rounded"
          checked={isChecked}
          onCheckedChange={handleCheckboxChange}
        />
        <div className="flex-1">
          <h4 className={cn("font-medium", isChecked && "line-through text-gray-400")}>
            {task.title}
          </h4>
          <p className="text-xs text-gray-500 mt-1">
            Due <span>{formattedDueDate}</span> • 
            Client: <span>{clientName}</span>
          </p>
        </div>
        <div className="flex items-center">
          {getPriorityBadge(task.priority)}
          <Button variant="ghost" size="icon" className="ml-2 text-gray-400 hover:text-gray-600">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
