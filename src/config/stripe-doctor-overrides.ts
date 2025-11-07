export interface DoctorStripeOverride {
  doctorId?: string;
  doctorName?: string;
  priceId: string;
  amountCents: number;
}

export const normalizeDoctorOverrideKey = (value?: string) =>
  (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

export const doctorStripeOverrides: DoctorStripeOverride[] = [
  {
    doctorId: '48b3e29c-496c-421e-8d14-f7a89ded452a',
    doctorName: 'dr. 1eyro',
    priceId: 'price_1SMwQpBYDGzP3ZGszzt7Esmp',
    amountCents: 100
  }
];

export const findDoctorStripeOverride = (
  doctorId?: string,
  doctorName?: string
): DoctorStripeOverride | undefined => {
  const normalizedId = normalizeDoctorOverrideKey(doctorId);
  const normalizedName = normalizeDoctorOverrideKey(doctorName);

  return doctorStripeOverrides.find((override) => {
    if (override.doctorId && normalizedId) {
      if (normalizeDoctorOverrideKey(override.doctorId) === normalizedId) {
        return true;
      }
    }

    if (override.doctorName && normalizedName) {
      if (normalizeDoctorOverrideKey(override.doctorName) === normalizedName) {
        return true;
      }
    }

    return false;
  });
};


