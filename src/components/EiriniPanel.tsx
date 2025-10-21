import React from 'react';
import DoctorPanel from './DoctorPanel';

interface EiriniPanelProps {
  language: 'gr' | 'en';
  onLogout?: () => void;
}

const EiriniPanel: React.FC<EiriniPanelProps> = ({ language, onLogout }) => {
  return (
    <DoctorPanel
      doctorName="Ειρήνη Στεργίου"
      doctorId="" // Δεν χρειάζεται πλέον - βρίσκεται με βάση το όνομα
      language={language}
      onLogout={onLogout}
    />
  );
};

export default EiriniPanel;
