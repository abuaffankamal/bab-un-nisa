import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Meeting, InsertMeeting } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function useMeetings() {
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Fetch all meetings
  const { data: meetings = [], isLoading, error } = useQuery<Meeting[]>({
    queryKey: ['/api/meetings'],
  });
  
  // Create a new meeting
  const createMutation = useMutation({
    mutationFn: async (meeting: Omit<InsertMeeting, "userId">) => {
      setIsUpdating(true);
      const response = await apiRequest("POST", "/api/meetings", meeting);
      const data = await response.json();
      return data;
    },
    onSuccess: () => {
      // Invalidate the meetings query to refetch
      queryClient.invalidateQueries({ queryKey: ['/api/meetings'] });
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error("Error creating meeting:", error);
      setIsUpdating(false);
    }
  });
  
  // Update an existing meeting
  const updateMutation = useMutation({
    mutationFn: async ({ id, meeting }: { id: number; meeting: Partial<InsertMeeting> }) => {
      setIsUpdating(true);
      const response = await apiRequest("PATCH", `/api/meetings/${id}`, meeting);
      const data = await response.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/meetings'] });
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error("Error updating meeting:", error);
      setIsUpdating(false);
    }
  });
  
  // Delete a meeting
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      setIsUpdating(true);
      await apiRequest("DELETE", `/api/meetings/${id}`, undefined);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/meetings'] });
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error("Error deleting meeting:", error);
      setIsUpdating(false);
    }
  });
  
  const createMeeting = async (meeting: Omit<InsertMeeting, "userId">) => {
    return createMutation.mutateAsync(meeting);
  };
  
  const updateMeeting = async (id: number, meeting: Partial<InsertMeeting>) => {
    return updateMutation.mutateAsync({ id, meeting });
  };
  
  const deleteMeeting = async (id: number) => {
    return deleteMutation.mutateAsync(id);
  };
  
  return {
    meetings,
    isLoading: isLoading || isUpdating,
    error,
    createMeeting,
    updateMeeting,
    deleteMeeting
  };
}
