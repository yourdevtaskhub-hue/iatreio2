/**
 * Timezone utilities για σωστό χειρισμό ημερομηνιών μεταξύ διαφορετικών ζωνών ώρας
 * Λύνει το πρόβλημα συγχρονισμού μεταξύ Ελλάδας και Ελβετίας
 */

// Timezone constants
export const TIMEZONES = {
  GREECE: 'Europe/Athens',
  SWITZERLAND: 'Europe/Zurich',
  UTC: 'UTC'
} as const;

/**
 * Μετατρέπει μια ημερομηνία σε UTC για αποθήκευση στη βάση δεδομένων
 * @param date - Η ημερομηνία που θα μετατραπεί
 * @param timezone - Η ζώνη ώρας (προεπιλογή: Ελλάδα)
 * @returns ISO string σε UTC
 */
export function toUTCString(date: Date | string, timezone: string = TIMEZONES.GREECE): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Δημιουργία ημερομηνίας στη συγκεκριμένη ζώνη ώρας
  const utcDate = new Date(dateObj.toLocaleString('en-US', { timeZone: timezone }));
  
  // Μετατροπή σε UTC
  return utcDate.toISOString();
}

/**
 * Μετατρέπει μια UTC ημερομηνία από τη βάση δεδομένων σε local time
 * @param utcString - Η UTC ημερομηνία από τη βάση
 * @param timezone - Η ζώνη ώρας προορισμού (προεπιλογή: Ελλάδα)
 * @returns Date object στη local timezone
 */
export function fromUTCString(utcString: string, timezone: string = TIMEZONES.GREECE): Date {
  const utcDate = new Date(utcString);
  
  // Μετατροπή στη συγκεκριμένη ζώνη ώρας
  return new Date(utcDate.toLocaleString('en-US', { timeZone: timezone }));
}

/**
 * Δημιουργεί μια ημερομηνία στη συγκεκριμένη ζώνη ώρας
 * @param year - Έτος
 * @param month - Μήνας (0-11)
 * @param day - Ημέρα
 * @param timezone - Η ζώνη ώρας (προεπιλογή: Ελλάδα)
 * @returns Date object στη συγκεκριμένη ζώνη ώρας
 */
export function createDateInTimezone(
  year: number, 
  month: number, 
  day: number, 
  timezone: string = TIMEZONES.GREECE
): Date {
  const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return new Date(dateString + 'T00:00:00');
}

/**
 * Παίρνει την τρέχουσα ημερομηνία στη συγκεκριμένη ζώνη ώρας
 * @param timezone - Η ζώνη ώρας (προεπιλογή: Ελλάδα)
 * @returns Date object στη συγκεκριμένη ζώνη ώρας
 */
export function getCurrentDateInTimezone(timezone: string = TIMEZONES.GREECE): Date {
  const now = new Date();
  return new Date(now.toLocaleString('en-US', { timeZone: timezone }));
}

/**
 * Μετατρέπει μια ημερομηνία σε YYYY-MM-DD format για τη βάση δεδομένων
 * @param date - Η ημερομηνία
 * @param timezone - Η ζώνη ώρας (προεπιλογή: Ελλάδα)
 * @returns YYYY-MM-DD string
 */
export function toDateString(date: Date | string, timezone: string = TIMEZONES.GREECE): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Μετατροπή στη συγκεκριμένη ζώνη ώρας
  const localDate = new Date(dateObj.toLocaleString('en-US', { timeZone: timezone }));
  
  return localDate.toISOString().slice(0, 10);
}

/**
 * Μετατρέπει μια ώρα σε HH:MM format για τη βάση δεδομένων
 * @param time - Η ώρα (string ή Date)
 * @param timezone - Η ζώνη ώρας (προεπιλογή: Ελλάδα)
 * @returns HH:MM string
 */
export function toTimeString(time: string | Date, timezone: string = TIMEZONES.GREECE): string {
  let dateObj: Date;
  
  if (typeof time === 'string') {
    // Αν είναι string, δημιουργούμε Date object για σήμερα με αυτή την ώρα
    const today = getCurrentDateInTimezone(timezone);
    const [hours, minutes] = time.split(':').map(Number);
    dateObj = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);
  } else {
    dateObj = time;
  }
  
  // Μετατροπή στη συγκεκριμένη ζώνη ώρας
  const localDate = new Date(dateObj.toLocaleString('en-US', { timeZone: timezone }));
  
  return localDate.toTimeString().slice(0, 5);
}

/**
 * Ελέγχει αν μια ημερομηνία είναι στο μέλλον στη συγκεκριμένη ζώνη ώρας
 * @param date - Η ημερομηνία
 * @param timezone - Η ζώνη ώρας (προεπιλογή: Ελλάδα)
 * @returns true αν είναι στο μέλλον
 */
export function isFutureDate(date: Date | string, timezone: string = TIMEZONES.GREECE): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = getCurrentDateInTimezone(timezone);
  
  return dateObj > now;
}

/**
 * Παίρνει την τρέχουσα ζώνη ώρας του browser
 * @returns Η ζώνη ώρας του browser
 */
export function getBrowserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Ελέγχει αν ο χρήστης είναι στην Ελλάδα ή Ελβετία
 * @returns 'Greece' ή 'Switzerland' ή 'Other'
 */
export function getUserLocation(): 'Greece' | 'Switzerland' | 'Other' {
  const browserTz = getBrowserTimezone();
  
  if (browserTz === TIMEZONES.GREECE) {
    return 'Greece';
  } else if (browserTz === TIMEZONES.SWITZERLAND) {
    return 'Switzerland';
  } else {
    return 'Other';
  }
}

/**
 * Παίρνει την κατάλληλη ζώνη ώρας για τον χρήστη
 * @returns Η ζώνη ώρας που θα χρησιμοποιηθεί
 */
export function getUserTimezone(): string {
  const location = getUserLocation();
  
  switch (location) {
    case 'Greece':
      return TIMEZONES.GREECE;
    case 'Switzerland':
      return TIMEZONES.SWITZERLAND;
    default:
      // Για άλλες χώρες, χρησιμοποιούμε την Ελλάδα ως default
      return TIMEZONES.GREECE;
  }
}

/**
 * Υπολογίζει το offset μιας timezone σε milliseconds για συγκεκριμένη ημερομηνία
 * Χρησιμοποιείται για να λάβουμε υπόψη DST (Daylight Saving Time)
 */
function getTimezoneOffsetForDate(date: Date, timezone: string): number {
  // Get the offset in milliseconds for a timezone at a specific date
  // This accounts for DST
  
  // Get what this UTC time would be in the timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  // Format the UTC date in the timezone
  const tzParts = formatter.formatToParts(date);
  const tzHour = parseInt(tzParts.find(p => p.type === 'hour')?.value || '0');
  const tzMinute = parseInt(tzParts.find(p => p.type === 'minute')?.value || '0');
  const tzSecond = parseInt(tzParts.find(p => p.type === 'second')?.value || '0');
  
  // Get UTC components
  const utcHour = date.getUTCHours();
  const utcMinute = date.getUTCMinutes();
  const utcSecond = date.getUTCSeconds();
  
  // Calculate offset in hours
  const hourDiff = tzHour - utcHour;
  const minuteDiff = tzMinute - utcMinute;
  const secondDiff = tzSecond - utcSecond;
  
  // Convert to milliseconds
  const offsetMs = (hourDiff * 60 + minuteDiff) * 60 * 1000 + secondDiff * 1000;
  
  return offsetMs;
}

/**
 * Μετατρέπει μια ώρα (time string) από μια timezone σε άλλη
 * Χρησιμοποιείται για να μετατρέψουμε availability times στη timezone του ασθενούς
 * @param dateStr - Η ημερομηνία (YYYY-MM-DD)
 * @param timeStr - Η ώρα (HH:MM:SS ή HH:MM)
 * @param fromTimezone - Η source timezone (π.χ. timezone του γιατρού)
 * @param toTimezone - Η target timezone (π.χ. timezone του ασθενούς)
 * @returns Μετατραπμένη ώρα στη μορφή HH:MM:SS
 */
export function convertTimeToTimezone(
  dateStr: string,
  timeStr: string,
  fromTimezone: string,
  toTimezone: string = getUserTimezone()
): string {
  if (fromTimezone === toTimezone) {
    return timeStr;
  }
  
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  // Greece (Europe/Athens) is 1 hour AHEAD of Switzerland (Europe/Zurich)
  // So: Switzerland 16:00 → Greece 17:00 (ADD 1 hour)
  //     Greece 17:00 → Switzerland 16:00 (SUBTRACT 1 hour)
  
  // Simple and correct approach: Direct hour calculation
  // For Europe/Zurich to Europe/Athens: +1 hour
  // For Europe/Athens to Europe/Zurich: -1 hour
  
  let newHour = hours;
  let newDay = day;
  let newMonth = month;
  let newYear = year;
  
  if (fromTimezone === TIMEZONES.SWITZERLAND && toTimezone === TIMEZONES.GREECE) {
    // Switzerland to Greece: ADD 1 hour
    newHour = hours + 1;
  } else if (fromTimezone === TIMEZONES.GREECE && toTimezone === TIMEZONES.SWITZERLAND) {
    // Greece to Switzerland: SUBTRACT 1 hour
    newHour = hours - 1;
  } else {
    // For other timezones, use Intl API
    const isoString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
    const tempDate = new Date(isoString);
    const sourceOffset = getTimezoneOffsetForDate(tempDate, fromTimezone);
    const targetOffset = getTimezoneOffsetForDate(tempDate, toTimezone);
    const offsetDiff = (targetOffset - sourceOffset) / (1000 * 60 * 60); // Convert to hours
    newHour = hours + offsetDiff;
  }
  
  // Handle hour overflow/underflow
  if (newHour >= 24) {
    newHour = newHour - 24;
    newDay++;
    const daysInMonth = new Date(year, month, 0).getDate();
    if (newDay > daysInMonth) {
      newDay = 1;
      newMonth++;
      if (newMonth > 12) {
        newMonth = 1;
        newYear++;
      }
    }
  } else if (newHour < 0) {
    newHour = 24 + newHour;
    newDay--;
    if (newDay < 1) {
      newMonth--;
      if (newMonth < 1) {
        newMonth = 12;
        newYear--;
      }
      newDay = new Date(newYear, newMonth, 0).getDate();
    }
  }
  
  return `${String(Math.floor(newHour)).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
}

/**
 * Προσδιορίζει την timezone ενός γιατρού
 * Αν ο γιατρός είναι από Ελβετία, επιστρέφει Europe/Zurich
 * Αλλιώς Europe/Athens (default)
 * @param doctorName - Το όνομα του γιατρού
 * @returns Η timezone του γιατρού
 */
export function getDoctorTimezone(doctorName?: string | null): string {
  if (!doctorName) {
    // Προσωρινά: αν δεν υπάρχει όνομα, υποθέτουμε Ελβετία (για testing)
    // Στο μέλλον, μπορείς να προσθέσεις doctor.timezone field στη βάση
    return TIMEZONES.SWITZERLAND;
  }
  
  // Ελέγχουμε αν ο γιατρός είναι στη λίστα γιατρών από Ελβετία
  try {
    // Dynamic import για να αποφύγουμε circular dependencies
    const { isDoctorInSwitzerland } = require('../config/doctor-timezones');
    if (isDoctorInSwitzerland(doctorName)) {
      return TIMEZONES.SWITZERLAND;
    }
  } catch (e) {
    // Αν αποτύχει το import, χρησιμοποιούμε fallback
  }
  
  // Fallback: αν το όνομα περιέχει "Switzerland" ή "Zurich"
  if (doctorName.toLowerCase().includes('switzerland') || doctorName.toLowerCase().includes('zurich')) {
    return TIMEZONES.SWITZERLAND;
  }
  
  // Προσωρινά: υποθέτουμε ότι όλοι οι γιατροί είναι από Ελβετία (για testing)
  // Στο μέλλον, μπορείς να προσθέσεις doctor.timezone field στη βάση ή να χρησιμοποιήσεις το config
  // return TIMEZONES.GREECE; // Default: Ελλάδα
  return TIMEZONES.SWITZERLAND; // Προσωρινά: Ελβετία για testing
}