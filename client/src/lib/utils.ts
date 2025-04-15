import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPhoneNumber(phoneNumber: string): string {
  const cleaned = ('' + phoneNumber).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3];
  }
  return phoneNumber;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`;
}

export function getColorForStatus(status: string): string {
  switch (status) {
    case 'scheduled':
    case 'confirmed':
      return '#4ADE80'; // green
    case 'pending':
      return '#FCD34D'; // yellow
    case 'cancelled':
      return '#F87171'; // red
    case 'completed':
      return '#60A5FA'; // blue
    default:
      return '#94A3B8'; // gray
  }
}

export function getColorForPriority(priority: string): string {
  switch (priority) {
    case 'urgent':
      return '#EF4444'; // red
    case 'high':
      return '#FB923C'; // orange
    case 'medium':
      return '#FBBF24'; // amber
    case 'low':
      return '#60A5FA'; // blue
    default:
      return '#94A3B8'; // gray
  }
}
