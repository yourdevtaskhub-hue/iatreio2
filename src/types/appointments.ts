export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  active: boolean;
}

export interface Availability {
  id: string;
  doctor_id: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  increment_minutes: 30 | 60;
}

export interface Appointment {
  id: string;
  doctor_id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration_minutes: 30 | 60;
  parent_name: string;
  child_age: string;
  email: string;
  phone: string;
  concerns: string;
  created_at: string;
}

export interface AdminSettings {
  id: string;
  lock_half_hour: boolean;
  updated_at: string;
}

export interface SlotInfo {
  time: string; // HH:MM
  available: boolean;
  reason?: 'booked' | 'outside' | 'locked';
}


