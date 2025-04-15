import axios from 'axios';
import { getCurrentLocation, geocodeLocation } from './locationService';

// Mock prayer times for demo
const MOCK_PRAYER_TIMES = {
  fajr: new Date(new Date().setHours(5, 30, 0, 0)),
  sunrise: new Date(new Date().setHours(6, 45, 0, 0)),
  dhuhr: new Date(new Date().setHours(12, 15, 0, 0)),
  asr: new Date(new Date().setHours(15, 30, 0, 0)),
  maghrib: new Date(new Date().setHours(18, 45, 0, 0)),
  isha: new Date(new Date().setHours(20, 0, 0, 0))
};

/**
 * Get prayer times for user's current location
 * @param date - Date for which to calculate prayer times (defaults to today)
 * @returns Promise with prayer times
 */
export async function getPrayerTimesForCurrentLocation(date: Date = new Date()): Promise<any> {
  try {
    const { latitude, longitude } = await getCurrentLocation();
    
    // In a real app, we would use the Adhan library here
    // For demo purposes, we'll return mock data
    return {
      prayerTimes: MOCK_PRAYER_TIMES,
      location: { latitude, longitude }
    };
  } catch (error) {
    console.error('Error getting prayer times for current location:', error);
    throw error;
  }
}

/**
 * Get prayer times for a specific location
 * @param locationName - Name of the location (city, address, etc.)
 * @param date - Date for which to calculate prayer times (defaults to today)
 * @returns Promise with prayer times
 */
export async function getPrayerTimesByLocation(locationName: string, date: Date = new Date()): Promise<any> {
  try {
    const { latitude, longitude } = await geocodeLocation(locationName);
    
    // In a real app, we would use the Adhan library here
    // For demo purposes, we'll return mock data
    return {
      prayerTimes: MOCK_PRAYER_TIMES,
      location: { latitude, longitude, name: locationName }
    };
  } catch (error) {
    console.error(`Error getting prayer times for ${locationName}:`, error);
    throw error;
  }
}

/**
 * Get the name of the current or next prayer
 * @param latitude - Latitude of the location
 * @param longitude - Longitude of the location
 * @returns Object with the current prayer name and the next prayer name
 */
export function getCurrentAndNextPrayer(
  latitude: number, 
  longitude: number
): { currentPrayer: string, nextPrayer: string, currentPrayerTime: Date, nextPrayerTime: Date } {
  // In a real app, we would calculate this based on actual prayer times
  // For demo purposes, we'll use the mock data
  const prayerTimes = MOCK_PRAYER_TIMES;
  const currentTime = new Date();
  
  const prayers = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
  let currentPrayer = '';
  let nextPrayer = '';
  let currentPrayerTime = new Date();
  let nextPrayerTime = new Date();
  
  // Find current and next prayer
  for (let i = 0; i < prayers.length; i++) {
    const prayer = prayers[i];
    const prayerTime = prayerTimes[prayer as keyof typeof prayerTimes];
    
    if (currentTime < prayerTime) {
      // This is the next prayer
      nextPrayer = prayer;
      nextPrayerTime = prayerTime;
      
      // The current prayer is the previous one
      const prevIndex = (i - 1 + prayers.length) % prayers.length;
      currentPrayer = prayers[prevIndex];
      currentPrayerTime = prayerTimes[currentPrayer as keyof typeof prayerTimes];
      
      break;
    }
    
    // If we've gone through all prayers, the next prayer is tomorrow's Fajr
    if (i === prayers.length - 1) {
      currentPrayer = 'isha';
      currentPrayerTime = prayerTimes.isha;
      nextPrayer = 'fajr';
      
      // Tomorrow's Fajr
      const tomorrowFajr = new Date(prayerTimes.fajr);
      tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
      nextPrayerTime = tomorrowFajr;
    }
  }
  
  return { currentPrayer, nextPrayer, currentPrayerTime, nextPrayerTime };
}