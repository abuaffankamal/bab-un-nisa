import { apiRequest } from "./queryClient";
import { Backup } from "@shared/schema";

// Function to create a new backup
export async function createBackup(): Promise<Backup> {
  const response = await apiRequest("POST", "/api/backups", {});
  return await response.json();
}

// Function to get all backups
export async function getBackups(): Promise<Backup[]> {
  const response = await fetch("/api/backups");
  return await response.json();
}

// Function to get the latest backup
export async function getLatestBackup(): Promise<Backup | null> {
  try {
    const response = await fetch("/api/backups/latest");
    if (response.status === 404) {
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching latest backup:", error);
    return null;
  }
}

// Function to restore from a backup
export async function restoreFromBackup(backupId: number): Promise<boolean> {
  try {
    const response = await apiRequest("POST", `/api/backups/${backupId}/restore`, {});
    return response.ok;
  } catch (error) {
    console.error("Error restoring from backup:", error);
    return false;
  }
}
