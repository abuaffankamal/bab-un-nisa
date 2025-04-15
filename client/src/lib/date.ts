import { format, formatDistance, formatRelative, isToday, isTomorrow, isYesterday } from "date-fns";

// Format date as Month, day, year (e.g., "October 12, 2023")
export function formatFullDate(date: Date): string {
  return format(date, "MMMM d, yyyy");
}

// Format time (e.g., "10:30 AM")
export function formatTime(date: Date): string {
  return format(date, "h:mm a");
}

// Format date as Month abbreviation (e.g., "OCT")
export function formatMonthAbbr(date: Date): string {
  return format(date, "MMM").toUpperCase();
}

// Format day of month (e.g., "12")
export function formatDay(date: Date): string {
  return format(date, "d");
}

// Format date as relative to now (e.g., "5 minutes ago", "in 3 days")
export function formatRelativeToNow(date: Date): string {
  return formatDistance(date, new Date(), { addSuffix: true });
}

// Format date specifically for meeting display
export function formatMeetingDate(date: Date): { month: string; day: string } {
  return {
    month: formatMonthAbbr(date),
    day: formatDay(date)
  };
}

// Format due date for tasks
export function formatDueDate(date: Date): string {
  if (isToday(date)) {
    return "Today";
  } else if (isTomorrow(date)) {
    return "Tomorrow";
  } else if (isYesterday(date)) {
    return "Yesterday";
  } else {
    return format(date, "MMM d");
  }
}

// Format date range (e.g., "Oct 10 - Oct 17, 2023")
export function formatDateRange(startDate: Date, endDate: Date): string {
  const sameYear = startDate.getFullYear() === endDate.getFullYear();
  const sameMonth = startDate.getMonth() === endDate.getMonth();
  
  if (sameYear && sameMonth) {
    return `${format(startDate, "MMM d")} - ${format(endDate, "d, yyyy")}`;
  } else if (sameYear) {
    return `${format(startDate, "MMM d")} - ${format(endDate, "MMM d, yyyy")}`;
  } else {
    return `${format(startDate, "MMM d, yyyy")} - ${format(endDate, "MMM d, yyyy")}`;
  }
}

// Format time for meetings
export function formatMeetingTime(time: string): string {
  // Assuming time is in format "HH:MM"
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours, 10);
  
  // Format as "10:30 AM" or "2:00 PM"
  const period = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  
  return `${formattedHour}:${minutes} ${period}`;
}
