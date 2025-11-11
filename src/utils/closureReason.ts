export type ClosureReasonTranslations = {
  gr: string;
  en: string;
  fr: string;
  fallback: string;
};

const emptyTranslations: ClosureReasonTranslations = {
  gr: '',
  en: '',
  fr: '',
  fallback: ''
};

export const parseClosureReason = (value: any): ClosureReasonTranslations => {
  if (!value) {
    return { ...emptyTranslations };
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === 'object') {
        return {
          gr: (parsed.gr || parsed.el || '') as string,
          en: (parsed.en || '') as string,
          fr: (parsed.fr || '') as string,
          fallback: ''
        };
      }
      return { gr: value, en: '', fr: '', fallback: value };
    } catch {
      return { gr: value, en: '', fr: '', fallback: value };
    }
  }

  if (typeof value === 'object') {
    return {
      gr: (value.gr || value.el || '') as string,
      en: (value.en || '') as string,
      fr: (value.fr || '') as string,
      fallback: (value.fallback || '') as string
    };
  }

  return { ...emptyTranslations };
};

export const getLocalizedClosureReason = (
  value: any,
  language: 'gr' | 'en' | 'fr'
): string => {
  const { gr, en, fr, fallback } = parseClosureReason(value);

  if (language === 'gr') {
    return gr || en || fr || fallback || '';
  }
  if (language === 'en') {
    return en || gr || fr || fallback || '';
  }
  if (language === 'fr') {
    return fr || gr || en || fallback || '';
  }
  return gr || en || fr || fallback || '';
};

