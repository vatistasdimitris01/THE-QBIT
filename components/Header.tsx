import React, { useState, useEffect, useRef } from 'react';

interface HeaderProps {
    country: string | null;
    onCountryChange: (country: string | null) => void;
    currentDate: Date;
    onDateChange: (direction: 'prev' | 'next') => void;
}

const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
};

const Header: React.FC<HeaderProps> = ({ country, onCountryChange, currentDate, onDateChange }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const formattedDate = new Intl.DateTimeFormat('el-GR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(currentDate);
    
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
            <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold tracking-tight font-serif uppercase">
                    THE QBIT
                </h1>

                <div className="flex items-center gap-2 sm:gap-4 bg-white border border-stone-200 rounded-full px-2 py-1 shadow-sm">
                    <button 
                        onClick={() => onDateChange('prev')} 
                        className="p-2 rounded-full hover:bg-stone-100 transition-colors"
                        aria-label="Προηγούμενη ημέρα"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <time className="text-sm font-medium text-stone-700 whitespace-nowrap px-2">{formattedDate}</time>
                    <button 
                        onClick={() => onDateChange('next')} 
                        disabled={isToday(currentDate)}
                        className="p-2 rounded-full hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        aria-label="Επόμενη ημέρα"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>

                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-2 text-stone-700 font-medium hover:text-stone-900 transition-colors focus:outline-none py-2 px-4"
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
        </header>
    );
};

export default Header;