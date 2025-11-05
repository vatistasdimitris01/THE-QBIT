import React, { useState, useEffect, useRef } from 'react';

interface HeaderProps {
    country: string | null;
    onCountryChange: (country: string | null) => void;
    showHomeButton: boolean;
    onGoHome: () => void;
}

const TimeDisplay: React.FC = () => {
    const [time, setTime] = useState('');

    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            const timeString = now.toLocaleTimeString('el-GR', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
                timeZone: 'Europe/Athens' 
            });
            setTime(timeString);
        };

        updateClock(); // Set time immediately
        const timerId = setInterval(updateClock, 1000); // Update every second

        return () => clearInterval(timerId); // Cleanup interval on component unmount
    }, []);

    if (!time) {
        return <div className="text-xs text-stone-500 font-sans hidden sm:block h-5 w-12"></div>; // Placeholder for layout consistency
    }

    return (
        <div className="hidden sm:flex items-center gap-3 text-sm text-stone-700">
            <span className="font-medium font-sans">{time}</span>
        </div>
    );
};


const Header: React.FC<HeaderProps> = ({ country, onCountryChange, showHomeButton, onGoHome }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header className="py-3 px-4 sm:px-6 lg:px-8 border-b border-stone-200 bg-stone-50/90 backdrop-blur-sm sticky top-0 z-20">
            <div className="container mx-auto flex justify-between items-center gap-4">
                <div className="flex items-center gap-4 md:gap-6">
                     {showHomeButton ? (
                        <button onClick={onGoHome} className="text-2xl font-bold tracking-tight font-serif uppercase hover:text-stone-600 transition-colors" aria-label="Επιστροφή στην αρχική">
                            THE QBIT
                        </button>
                    ) : (
                        <h1 className="text-2xl font-bold tracking-tight font-serif uppercase">
                           THE QBIT
                        </h1>
                    )}
                    <TimeDisplay />
                </div>


                <div className="flex items-center">
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-2 text-stone-700 font-medium hover:text-stone-900 transition-colors focus:outline-none py-2 px-4"
                            aria-label="Επιλογή έκδοσης ειδήσεων"
                        >
                            <span>{country === 'Ελλάδα' ? 'Ελλάδα' : 'Παγκόσμια'}</span>
                            <svg className="h-4 w-4 text-stone-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                               <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-40 bg-white border border-stone-200 rounded-md shadow-lg z-30">
                                <button
                                    onClick={() => { onCountryChange('Ελλάδα'); setIsDropdownOpen(false); }}
                                    className="block w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-100 transition-colors"
                                >
                                    Ελλάδα
                                </button>
                                <button
                                    onClick={() => { onCountryChange(null); setIsDropdownOpen(false); }}
                                    className="block w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-100 transition-colors"
                                >
                                    Παγκόσμια
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
