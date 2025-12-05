/**
 * Country flags utility functions
 * Προσδιορίζει τη χώρα από timezone και επιστρέφει το country flag emoji
 */

import { TIMEZONES } from './timezone';

/**
 * Προσδιορίζει τη χώρα από timezone
 * @param timezone - Η timezone (π.χ. 'Europe/Athens', 'Asia/Nicosia', 'Europe/Zurich')
 * @returns Η χώρα ('Greece', 'Cyprus', 'Switzerland', ή 'Other')
 */
export function getCountryFromTimezone(timezone: string | null | undefined): 'Greece' | 'Cyprus' | 'Switzerland' | 'Other' {
  if (!timezone) {
    return 'Other';
  }

  const normalizedTimezone = timezone.trim();

  if (normalizedTimezone === TIMEZONES.GREECE) {
    return 'Greece';
  } else if (normalizedTimezone === TIMEZONES.CYPRUS) {
    return 'Cyprus';
  } else if (normalizedTimezone === TIMEZONES.SWITZERLAND) {
    return 'Switzerland';
  } else {
    return 'Other';
  }
}

/**
 * Επιστρέφει το country flag emoji για μια χώρα
 * @param country - Η χώρα ('Greece', 'Cyprus', 'Switzerland', ή 'Other')
 * @returns Το country flag emoji
 */
export function getCountryFlag(country: 'Greece' | 'Cyprus' | 'Switzerland' | 'Other'): string {
  switch (country) {
    case 'Greece':
      return '🇬🇷'; // Greece flag
    case 'Cyprus':
      return '🇨🇾'; // Cyprus flag
    case 'Switzerland':
      return '🇨🇭'; // Switzerland flag
    default:
      return '🌍'; // Globe emoji for other countries
  }
}

/**
 * Επιστρέφει το country flag emoji από timezone
 * @param timezone - Η timezone (π.χ. 'Europe/Athens', 'Asia/Nicosia', 'Europe/Zurich')
 * @returns Το country flag emoji
 */
export function getCountryFlagFromTimezone(timezone: string | null | undefined): string {
  const country = getCountryFromTimezone(timezone);
  return getCountryFlag(country);
}

/**
 * Επιστρέφει το όνομα της χώρας στα ελληνικά
 * @param country - Η χώρα ('Greece', 'Cyprus', 'Switzerland', ή 'Other')
 * @returns Το όνομα της χώρας στα ελληνικά
 */
export function getCountryNameGreek(country: 'Greece' | 'Cyprus' | 'Switzerland' | 'Other'): string {
  switch (country) {
    case 'Greece':
      return 'Ελλάδα';
    case 'Cyprus':
      return 'Κύπρος';
    case 'Switzerland':
      return 'Ελβετία';
    default:
      return 'Άλλη χώρα';
  }
}

/**
 * Επιστρέφει το tooltip text για το country flag
 * @param timezone - Η timezone (π.χ. 'Europe/Athens', 'Asia/Nicosia', 'Europe/Zurich')
 * @returns Το tooltip text στα ελληνικά
 */
export function getCountryFlagTooltip(timezone: string | null | undefined): string {
  const country = getCountryFromTimezone(timezone);
  return getCountryNameGreek(country);
}

