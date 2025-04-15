import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useBackups } from "@/hooks/useBackups";
import { format } from "date-fns";

export default function BackupStatus() {
  const { backups, createBackup, isLoading } = useBackups();
  
  const latestBackup = backups.length > 0 ? backups[0] : null;
  
  // Format the timestamp for display
  const formatBackupDate = (timestamp: Date) => {
    return format(timestamp, "MMM d, yyyy");
  };
  
  const formatBackupTime = (timestamp: Date) => {
    return format(timestamp, "h:mm a");
  };
  
  const handleRestore = (backupId: number) => {
    // In a real app, this would call an API to restore data from the backup
    console.log(`Restoring from backup ${backupId}`);
  };

  return (
    <Card className="border border-gray-100">
      <CardHeader className="border-b border-gray-100 p-4">
        <CardTitle className="text-base font-semibold">Backup & Recovery</CardTitle>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium">Last Automatic Backup</p>
            <p className="text-xs text-gray-500">
              {latestBackup 
                ? `${formatBackupDate(new Date(latestBackup.timestamp))} - ${formatBackupTime(new Date(latestBackup.timestamp))}`
                : "No backups yet"}
            </p>
          </div>
          <Badge className="bg-green-100 text-green-700">{latestBackup?.status || "N/A"}</Badge>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
          <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: "45%" }}></div>
        </div>
        <p className="text-xs text-gray-500 mb-4">45% of storage used (450MB of 1GB)</p>
        
        <div className="border-t border-gray-100 pt-4">
          <p className="text-sm font-medium mb-2">Recovery Points</p>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {isLoading ? (
              <p className="text-center text-xs py-2">Loading backups...</p>
            ) : backups.length === 0 ? (
              <p className="text-center text-xs py-2">No recovery points available</p>
            ) : (
              backups.map((backup) => (
                <div key={backup.id} className="text-xs p-2 border border-gray-200 rounded flex items-center justify-between">
                  <div>
                    <span className="font-medium">{formatBackupDate(new Date(backup.timestamp))}</span> - 
                    <span> {formatBackupTime(new Date(backup.timestamp))}</span>
                    <span className="text-gray-500"> ({backup.type})</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-primary-600 hover:text-primary-800 h-auto py-0"
                    onClick={() => handleRestore(backup.id)}
                  >
                    Restore
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
      
      <div className="p-4 border-t border-gray-100">
        <Button variant="outline" className="w-full py-2 bg-primary-50 text-primary-700 text-sm font-medium rounded-lg border border-primary-100 hover:bg-primary-100">
          Backup & Recovery Settings
        </Button>
      </div>
    </Card>
  );
}
