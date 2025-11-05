import React, { useState, useEffect, useRef } from 'react';

interface GenerationScreenProps {
    message: string;
}

const TOTAL_ESTIMATED_TIME = 30; // Increased for more realistic pacing

const GenerationScreen: React.FC<GenerationScreenProps> = ({ message }) => {
    const [countdown, setCountdown] = useState(TOTAL_ESTIMATED_TIME);
    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        setCountdown(TOTAL_ESTIMATED_TIME);

        const updateTimer = () => {
            setCountdown(prev => {
                if (prev > 10) {
                    // Fast stage
                    timerRef.current = window.setTimeout(updateTimer, 1000); // 1s interval
                    return prev - 1;
                }
                if (prev > 2) {
                    // Slow stage
                    timerRef.current = window.setTimeout(updateTimer, 2000); // Slower interval
                    return prev - 1;
                }
                // Hold at 2s, then drop to 1s and stay there
                if (prev === 2) {
                     timerRef.current = window.setTimeout(updateTimer, 4000); // Long pause at 2s
                     return prev - 1;
                }
                
                return 1; // Stay at 1
            });
        };

        // Start the first tick
        timerRef.current = window.setTimeout(updateTimer, 1000);

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
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
                <p className="font-mono mt-4 text-base tracking-widest bg-stone-200/50 px-3 py-1 rounded-md">Εκτιμώμενος χρόνος: ~{countdown}s</p>
            </div>
        </div>
    );
};

export default GenerationScreen;