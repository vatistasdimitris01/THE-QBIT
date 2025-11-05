import React, { useState, useEffect } from 'react';

interface GenerationScreenProps {
    message: string;
}

const ESTIMATED_TIME = 25; // Estimated generation time in seconds

const GenerationScreen: React.FC<GenerationScreenProps> = ({ message }) => {
  const [countdown, setCountdown] = useState(ESTIMATED_TIME);

  useEffect(() => {
    // Reset countdown when the component is shown
    setCountdown(ESTIMATED_TIME); 
    
    const timer = setInterval(() => {
        setCountdown(prev => (prev > 1 ? prev - 1 : 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [message]); // Rerun effect if the message changes

  return (
    <div className="flex flex-col items-center justify-center h-full py-20 text-center">
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 bg-stone-900 rounded-full animate-breath"></div>
      </div>
      <p className="mb-4 text-lg text-stone-800 tracking-wider font-medium">{message}</p>
      <div className="text-sm text-stone-500">
        <p>Η τεχνητή νοημοσύνη αναλύει τα τελευταία γεγονότα...</p>
        <p className="font-mono mt-4 text-base tracking-widest bg-stone-200/50 px-3 py-1 rounded-md">Εκτιμώμενος χρόνος: ~{countdown}s</p>
      </div>
    </div>
  );
};

export default GenerationScreen;