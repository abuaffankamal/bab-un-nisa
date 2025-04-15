import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Task, InsertTask } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function useTasks() {
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Fetch all tasks
  const { data: tasks = [], isLoading, error } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
  });
  
  // Create a new task
  const createMutation = useMutation({
    mutationFn: async (task: Omit<InsertTask, "userId">) => {
      setIsUpdating(true);
      const response = await apiRequest("POST", "/api/tasks", task);
      const data = await response.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error("Error creating task:", error);
      setIsUpdating(false);
    }
  });
  
  // Update an existing task
  const updateMutation = useMutation({
    mutationFn: async ({ id, task }: { id: number; task: Partial<InsertTask> }) => {
      setIsUpdating(true);
      const response = await apiRequest("PATCH", `/api/tasks/${id}`, task);
      const data = await response.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error("Error updating task:", error);
      setIsUpdating(false);
    }
  });
  
  // Delete a task
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      setIsUpdating(true);
      await apiRequest("DELETE", `/api/tasks/${id}`, undefined);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error("Error deleting task:", error);
      setIsUpdating(false);
    }
  });
  
  const createTask = async (task: Omit<InsertTask, "userId">) => {
    return createMutation.mutateAsync(task);
  };
  
  const updateTask = async (id: number, task: Partial<InsertTask>) => {
    return updateMutation.mutateAsync({ id, task });
  };
  
  const deleteTask = async (id: number) => {
    return deleteMutation.mutateAsync(id);
  };
  
  // Get completed tasks
  const completedTasks = tasks.filter(task => task.completed);
  
  // Get pending tasks
  const pendingTasks = tasks.filter(task => !task.completed);
  
  return {
    tasks,
    completedTasks,
    pendingTasks,
    isLoading: isLoading || isUpdating,
    error,
    createTask,
    updateTask,
    deleteTask
  };
}
