import React from 'react';

interface InitialScreenProps {
    onStartBriefing: (category: string | null) => void;
}

// Localize categories to Greek
const CATEGORIES = [
    { name: 'Πολιτική', value: 'Politics' },
    { name: 'Οικονομία', value: 'Economy' },
    { name: 'Τεχνολογία', value: 'Technology' },
    { name: 'Κόσμος', value: 'World' },
    { name: 'Κοινωνία', value: 'Society' },
    { name: 'Αθλητισμός', value: 'Sports' },
];

const InitialScreen: React.FC<InitialScreenProps> = ({ onStartBriefing }) => {
    return (
        <div className="max-w-5xl mx-auto w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-center">
                
                {/* Left Column: Main Welcome & CTA */}
                <div className="text-center md:text-left">
                    <h1 className="text-5xl md:text-6xl font-serif text-stone-900 mb-4">
                        THE QBIT
                    </h1>
                    <p className="text-lg text-stone-600 mb-10 max-w-md mx-auto md:mx-0">
                        Το μόνο που χρειάζεται να διαβάσετε σήμερα, επιμελημένο από AI.
                    </p>

                    <div className="flex justify-center md:justify-start">
                        <button
                            onClick={() => onStartBriefing(null)}
                            className="px-8 py-4 bg-stone-900 text-stone-50 font-bold tracking-wider uppercase hover:bg-stone-700 transition-colors text-lg shadow-lg hover:shadow-xl"
                        >
                            Διαβάστε την έκδοση
                        </button>
                    </div>
                </div>

                {/* Right Column: Category Selection Panel */}
                <div className="w-full bg-stone-100/80 border border-stone-200/80 rounded-xl p-6 lg:p-8">
                    <h2 className="text-lg font-bold text-stone-800 mb-1 tracking-wide uppercase font-sans">
                        Περιεχόμενα
                    </h2>
                    <p className="text-sm text-stone-500 mb-5">Επιλέξτε μια κατηγορία για εστιασμένη ενημέρωση.</p>
                    <div className="space-y-1">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.value}
                                onClick={() => onStartBriefing(cat.value)}
                                className="w-full text-left p-3 flex justify-between items-center group rounded-md hover:bg-stone-200/80 transition-colors"
                            >
                                <span className="text-lg font-medium text-stone-700 group-hover:text-stone-900">
                                    {cat.name}
                                </span>
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    className="h-5 w-5 text-stone-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" 
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InitialScreen;