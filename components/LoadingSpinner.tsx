import React, { useState, useEffect, useRef } from 'react';

interface GenerationScreenProps {
    message: string;
}

const TOTAL_ESTIMATED_TIME = 45;

const GenerationScreen: React.FC<GenerationScreenProps> = ({ message }) => {
    const [countdown, setCountdown] = useState(TOTAL_ESTIMATED_TIME);
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        setCountdown(TOTAL_ESTIMATED_TIME);

        // Clear any existing interval when the component re-renders
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        intervalRef.current = window.setInterval(() => {
            setCountdown(prev => {
                if (prev > 1) {
                    return prev - 1;
                }
                
                // When countdown reaches 1, stop the interval
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
                return 1;
            });
        }, 1000);

        // Cleanup on component unmount
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [message]);

    return (
        <div className="flex flex-col items-center justify-center h-full py-20 text-center">
            <div className="relative w-24 h-24 mb-8">
                <div className="absolute inset-0 bg-stone-900 rounded-full animate-breath"></div>
            </div>
            <p className="mb-4 text-lg text-stone-800 tracking-wider font-medium">{message}</p>
            <div className="text-sm text-stone-500">
                <p>Η τεχνητή νοημοσύνη αναλύει τα τελευταία γεγονότα...</p>
                <p className="font-mono mt-4 text-base tracking-widest bg-stone-200/50 px-3 py-1 rounded-md">
                   {countdown > 1 ? `Εκτιμώμενος χρόνος: ~${countdown}s` : 'Σχεδόν έτοιμο...'}
                </p>
            </div>
        </div>
    );
};

export default GenerationScreen;