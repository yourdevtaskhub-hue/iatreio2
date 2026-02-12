/**
 * Centralized utility for appointment status handling
 * Maps status values to colors and availability for rendering
 */

export type AppointmentStatus = 'booked' | 'cancelled' | 'pending' | 'available' | null;
export type UserRole = 'admin' | 'user';

/**
 * Get the color for a slot based on its status and user role
 * @param status - The appointment status (booked, cancelled, pending, available, or null for legacy)
 * @param role - The user role (admin or user)
 * @returns CSS color class or hex color value
 */
export function getSlotColor(
  status: AppointmentStatus | undefined,
  role: UserRole = 'user'
): string {
  // Handle legacy appointments (status = null) as booked
  const effectiveStatus = status ?? 'booked';

  switch (effectiveStatus) {
    case 'booked':
      // Booked slots: Red for users, Blue for admins
      return role === 'admin' ? '#3B82F6' : '#EF4444'; // blue-500 : red-500
    
    case 'cancelled':
      // Cancelled slots: Gray (no longer available)
      return '#9CA3AF'; // gray-400
    
    case 'pending':
      // Pending slots: Yellow (awaiting confirmation)
      return '#FBBF24'; // amber-400
    
    case 'available':
      // Available slots: Green (can be booked)
      return '#10B981'; // emerald-500
    
    default:
      // Default to green for unknown status
      return '#10B981'; // emerald-500
  }
}

/**
 * Check if a slot is selectable (user can book it)
 * @param status - The appointment status
 * @returns true if slot can be booked, false otherwise
 */
export function isSlotSelectable(status: AppointmentStatus | undefined): boolean {
  const effectiveStatus = status ?? 'booked';

  switch (effectiveStatus) {
    case 'available':
      return true;
    case 'booked':
    case 'cancelled':
    case 'pending':
      return false;
    default:
      return false;
  }
}

/**
 * Get human-readable status label
 * @param status - The appointment status
 * @param language - The language code (en, gr, fr)
 * @returns Human-readable status label
 */
export function getStatusLabel(
  status: AppointmentStatus | undefined,
  language: string = 'en'
): string {
  const effectiveStatus = status ?? 'booked';

  const labels: Record<string, Record<string, string>> = {
    en: {
      booked: 'Booked',
      cancelled: 'Cancelled',
      pending: 'Pending',
      available: 'Available'
    },
    gr: {
      booked: 'Κρατημένο',
      cancelled: 'Ακυρώθηκε',
      pending: 'Σε Εκκρεμότητα',
      available: 'Διαθέσιμο'
    },
    fr: {
      booked: 'Réservé',
      cancelled: 'Annulé',
      pending: 'En Attente',
      available: 'Disponible'
    }
  };

  return labels[language]?.[effectiveStatus] || labels['en'][effectiveStatus];
}

/**
 * Filter booked appointments safely (handles both explicit status and legacy NULL)
 * @param appointments - Array of appointments
 * @returns Array of appointments that are marked as booked or have NULL status (legacy)
 */
export function filterBookedAppointments(
  appointments: Array<{ status?: AppointmentStatus | null }>
): Array<{ status?: AppointmentStatus | null }> {
  return appointments.filter(
    (apt) => apt.status === 'booked' || apt.status === null
  );
}

/**
 * Safety check for slot conflicts
 * Returns true if a slot is already taken (booked or pending)
 * @param appointments - Array of appointments for a specific slot
 * @returns true if slot is taken, false if available
 */
export function isSlotTaken(
  appointments: Array<{ status?: AppointmentStatus | null }>
): boolean {
  return filterBookedAppointments(appointments).length > 0;
}
