import React from 'react';
import DoctorPanel from './DoctorPanel';

interface SofiaPanelProps {
  language: 'gr' | 'en';
  onLogout?: () => void;
}

const SofiaPanel: React.FC<SofiaPanelProps> = ({ language, onLogout }) => {
  return (
    <DoctorPanel
      doctorName="Σοφία Σπυριάδου"
      doctorId="" // Δεν χρειάζεται πλέον - βρίσκεται με βάση το όνομα
      language={language}
      onLogout={onLogout}
    />
  );
};

export default SofiaPanel;
