import React from 'react';

interface ScrollProgressIndicatorProps {
    storiesLeft: number;
    isVisible: boolean;
}

const ScrollProgressIndicator: React.FC<ScrollProgressIndicatorProps> = ({ storiesLeft, isVisible }) => {
    return (
        <div 
            className={`fixed top-1/2 -translate-y-1/2 right-4 sm:right-6 lg:right-8 z-10 p-3 bg-stone-900/80 text-white rounded-full shadow-lg backdrop-blur-sm flex flex-col items-center justify-center transition-all duration-300 ease-in-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}
            style={{ width: '64px', height: '64px' }}
            aria-live="polite"
            aria-hidden={!isVisible}
        >
            <span className="text-2xl font-bold font-serif leading-none">{storiesLeft}</span>
            <span className="text-[10px] uppercase tracking-wider leading-none mt-1">left</span>
        </div>
    );
};

export default ScrollProgressIndicator;
