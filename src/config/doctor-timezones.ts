/**
 * Configuration για timezones των γιατρών
 * Προσθέστε εδώ τους γιατρούς που είναι από Ελβετία
 */

export const DOCTORS_IN_SWITZERLAND: Set<string> = new Set([
  // Προσθέστε εδώ τα ονόματα των γιατρών από Ελβετία
  // Παράδειγμα: 'Όνομα Γιατρού'
]);

/**
 * Ελέγχει αν ένας γιατρός είναι από Ελβετία
 */
export function isDoctorInSwitzerland(doctorName?: string | null): boolean {
  if (!doctorName) return false;
  return DOCTORS_IN_SWITZERLAND.has(doctorName.trim());
}

