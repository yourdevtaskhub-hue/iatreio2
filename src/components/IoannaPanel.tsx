import React from 'react';
import DoctorPanel from './DoctorPanel';

interface IoannaPanelProps {
  language: 'gr' | 'en';
  onLogout?: () => void;
}

const IoannaPanel: React.FC<IoannaPanelProps> = ({ language, onLogout }) => {
  return (
    <DoctorPanel
      doctorName="Ιωάννα Πισσάρη"
      doctorId="" // Δεν χρειάζεται πλέον - βρίσκεται με βάση το όνομα
      language={language}
      onLogout={onLogout}
    />
  );
};

export default IoannaPanel;
