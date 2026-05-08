import { useState } from 'react';

const generateQueueWaitTimes = (queueCount) => {
  return Array.from({ length: queueCount }, (_, i) => ({
    id: i + 1,
    label: `Patient ${String.fromCharCode(65 + i)}`,
    waitMins: Math.floor(Math.random() * 8) + 8
  }));
};

const useQueue = (doctor) => {
  const [isInQueue, setIsInQueue] = useState(false);
  const [patientInfo, setPatientInfo] = useState(null);
  const [effectiveQueueCount, setEffectiveQueueCount] = useState(doctor?.queueCount || 0);
  const [patientsAhead, setPatientsAhead] = useState([]);
  const [totalWaitSeconds, setTotalWaitSeconds] = useState(0);

  const joinQueue = (name, reason) => {
    setPatientInfo({ name, reason });
    const generatedPatients = generateQueueWaitTimes(effectiveQueueCount);
    setPatientsAhead(generatedPatients);
    
    const waitMins = generatedPatients.reduce((sum, p) => sum + p.waitMins, 0);
    const calculatedWaitSeconds = waitMins > 0 ? waitMins * 60 : 30; // 30s buffer if queue is empty
    setTotalWaitSeconds(calculatedWaitSeconds);
    
    setIsInQueue(true);
  };

  const leaveQueue = () => {
    setIsInQueue(false);
    setPatientInfo(null);
    setEffectiveQueueCount(prev => prev + 1);
    setPatientsAhead([]);
    setTotalWaitSeconds(0);
  };

  return {
    isInQueue,
    queuePosition: effectiveQueueCount + 1,
    patientsAhead,
    totalWaitSeconds,
    patientInfo,
    joinQueue,
    leaveQueue,
    effectiveQueueCount
  };
};

export default useQueue;
