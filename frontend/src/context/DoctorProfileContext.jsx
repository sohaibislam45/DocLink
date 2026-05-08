import React, { createContext, useContext } from 'react';

const DoctorProfileContext = createContext();

export const useDoctorProfile = () => {
  const context = useContext(DoctorProfileContext);
  if (!context) {
    throw new Error('useDoctorProfile must be used within a DoctorProfileProvider');
  }
  return context;
};

export const DoctorProfileProvider = ({ doctor, children }) => {
  return (
    <DoctorProfileContext.Provider value={{ doctor }}>
      {children}
    </DoctorProfileContext.Provider>
  );
};
