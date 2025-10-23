import React from 'react';
import { Clock, Globe } from 'lucide-react';
import { getUserTimezone, getUserLocation } from '../lib/timezone';

interface TimezoneInfoProps {
  language: 'gr' | 'en' | 'fr';
}

const TimezoneInfo: React.FC<TimezoneInfoProps> = ({ language }) => {
  const userTimezone = getUserTimezone();
  const userLocation = getUserLocation();
  
  const content = {
    gr: {
      timezoneInfo: 'Πληροφορίες Ζώνης Ώρας',
      currentTimezone: 'Τρέχουσα Ζώνη Ώρας',
      location: 'Τοποθεσία',
      greece: 'Ελλάδα',
      switzerland: 'Ελβετία',
      other: 'Άλλη Χώρα',
      note: 'Οι ημερομηνίες εμφανίζονται στη τοπική σας ώρα'
    },
    en: {
      timezoneInfo: 'Timezone Information',
      currentTimezone: 'Current Timezone',
      location: 'Location',
      greece: 'Greece',
      switzerland: 'Switzerland',
      other: 'Other Country',
      note: 'Dates are displayed in your local time'
    },
    fr: {
      timezoneInfo: 'Informations de Fuseau Horaire',
      currentTimezone: 'Fuseau Horaire Actuel',
      location: 'Localisation',
      greece: 'Grèce',
      switzerland: 'Suisse',
      other: 'Autre Pays',
      note: 'Les dates sont affichées dans votre heure locale'
    }
  };

  const getLocationText = (location: string) => {
    switch (location) {
      case 'Greece':
        return content[language].greece;
      case 'Switzerland':
        return content[language].switzerland;
      default:
        return content[language].other;
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <Globe className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-medium text-blue-800">
          {content[language].timezoneInfo}
        </span>
      </div>
      <div className="space-y-1 text-sm text-blue-700">
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3" />
          <span>{content[language].currentTimezone}: {userTimezone}</span>
        </div>
        <div className="flex items-center gap-2">
          <Globe className="w-3 h-3" />
          <span>{content[language].location}: {getLocationText(userLocation)}</span>
        </div>
        <div className="text-xs text-blue-600 mt-2">
          {content[language].note}
        </div>
      </div>
    </div>
  );
};

export default TimezoneInfo;
