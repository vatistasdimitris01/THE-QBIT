import React from 'react';

interface ScrollProgressIndicatorProps {
    storiesLeft: number;
    isVisible: boolean;
}

const ScrollProgressIndicator: React.FC<ScrollProgressIndicatorProps> = ({ storiesLeft, isVisible }) => {
    const storyText = storiesLeft === 1 ? 'ιστορία απομένει' : 'ιστορίες απομένουν';

    return (
        <div 
            className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8 z-10 px-4 py-2 bg-stone-900/80 text-white rounded-full shadow-lg backdrop-blur-sm flex items-center gap-2 transition-all duration-300 ease-in-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
            aria-live="polite"
            aria-hidden={!isVisible}
        >
            <span className="text-sm font-medium font-sans">~{storiesLeft} {storyText}</span>
        </div>
    );
};

export default ScrollProgressIndicator;