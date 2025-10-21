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
