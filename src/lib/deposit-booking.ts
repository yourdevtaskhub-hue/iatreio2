export interface DepositBookingPayload {
  doctorId: string;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  parentName: string;
  parentEmail: string;
  phone?: string;
  concerns?: string;
}

interface DepositBookingResponse {
  success: boolean;
  appointmentId: string;
  message: string;
}

const getFunctionsBases = (): string[] => {
  const envBase = (import.meta as any)?.env?.VITE_NETLIFY_FUNCTIONS_BASE as string | undefined;
  const bases: string[] = [];

  if (typeof window !== 'undefined' && window.location?.origin) {
    bases.push(`${window.location.origin}/.netlify/functions`);
  }

  if (envBase) {
    bases.push(envBase);
  }

  bases.push('https://parentteenonlineclinic.com/.netlify/functions');
  bases.push('https://www.parentteenonlineclinic.com/.netlify/functions');
  bases.push('http://localhost:8888/.netlify/functions');

  return Array.from(new Set(bases.filter(Boolean))).map((base) => base.replace(/\/$/, ''));
};

export const bookAppointmentUsingDeposit = async (
  payload: DepositBookingPayload
): Promise<DepositBookingResponse> => {
  let lastError: Error | null = null;
  let lastResponse: Response | null = null;

  for (const base of getFunctionsBases()) {
    try {
      const response = await fetch(`${base}/book-appointment-with-deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'omit',
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        return (await response.json()) as DepositBookingResponse;
      }

      lastResponse = response;
      lastError = new Error(`Request failed with status ${response.status}`);
    } catch (error: any) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  if (lastResponse) {
    try {
      const text = await lastResponse.clone().text();
      const data = text ? JSON.parse(text) : null;
      const message = data?.message || data?.error || text;
      throw new Error(message || 'Αποτυχία σύνδεσης με τον διακομιστή.');
    } catch {
      // Fall through to throw lastError below if parsing fails
    }
  }

  throw lastError || new Error('Αποτυχία κράτησης με deposit.');
};

