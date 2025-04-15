import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Backup } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { createBackup as createBackupService, getBackups as getBackupsService } from "@/lib/backupService";

export function useBackups() {
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Fetch all backups
  const { data: backups = [], isLoading, error } = useQuery<Backup[]>({
    queryKey: ['/api/backups'],
  });
  
  // Create a new backup
  const createMutation = useMutation({
    mutationFn: async () => {
      setIsUpdating(true);
      return await createBackupService();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/backups'] });
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error("Error creating backup:", error);
      setIsUpdating(false);
    }
  });
  
  // Restore from a backup
  const restoreMutation = useMutation({
    mutationFn: async (id: number) => {
      setIsUpdating(true);
      const response = await apiRequest("POST", `/api/backups/${id}/restore`, {});
      return response.ok;
    },
    onSuccess: () => {
      // After restoring, refresh all data
      queryClient.invalidateQueries();
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error("Error restoring from backup:", error);
      setIsUpdating(false);
    }
  });
  
  const createBackup = async () => {
    return createMutation.mutateAsync();
  };
  
  const restoreFromBackup = async (id: number) => {
    return restoreMutation.mutateAsync(id);
  };
  
  // Get the latest backup
  const latestBackup = backups.length > 0 ? backups[0] : null;
  
  return {
    backups,
    latestBackup,
    isLoading: isLoading || isUpdating,
    error,
    createBackup,
    restoreFromBackup
  };
}
