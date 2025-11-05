import React, { useState } from 'react';
import type { StorySource } from '../types';

interface SourceListProps {
    sources: StorySource[];
}

const SourceList: React.FC<SourceListProps> = ({ sources }) => {
    const [isOpen, setIsOpen] = useState(false);
    const displayedSources = sources.slice(0, 5); // Show max 5 favicons in stack

    const getDomain = (uri: string): string | null => {
        try {
            return new URL(uri).hostname.replace(/^www\./, '');
        } catch (e) {
            return null;
        }
    };

    if (isOpen) {
        return (
            <div className="max-w-2xl mx-auto">
                 <div className="text-center mb-8">
                    <h3 className="text-lg font-semibold font-serif text-stone-800">Πηγές Ειδήσεων</h3>
                    <button onClick={() => setIsOpen(false)} className="text-sm text-stone-600 hover:underline">Απόκρυψη</button>
                </div>
                <ul className="space-y-3">
                    {sources.map((source, index) => {
                        const domain = getDomain(source.uri);
                        if (!domain) return null;
                        
                        const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
                        return (
                            <li key={`${source.uri}-${index}`}>
                                <a 
                                    href={source.uri} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="flex items-center gap-4 p-3 bg-white border border-stone-200 rounded-lg shadow-sm hover:shadow-md hover:border-stone-400 transition-all duration-200 ease-in-out w-full h-full"
                                >
                                    <img 
                                        src={faviconUrl} 
                                        alt={`Favicon for ${domain}`}
                                        className="w-8 h-8 flex-shrink-0 bg-white rounded-md border border-stone-100 p-1 object-contain"
                                        width="32"
                                        height="32"
                                        onError={(e) => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2U1ZTdlYiI+PHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6Ij48L3BhdGg+PC9zdmc+`;
                                        }}
                                    />
                                    <div className="overflow-hidden">
                                        <p className="text-base font-medium text-stone-800 truncate" title={source.title}>
                                            {source.title}
                                        </p>
                                        <p className="text-sm text-stone-500">
                                            {domain}
                                        </p>
                                    </div>
                                </a>
                            </li>
                        );
                    })}
                </ul>
            </div>
        )
    }

    return (
        <div className="text-center">
            <div className="text-center mb-6">
                <h3 className="inline-block bg-stone-800 text-stone-100 text-sm font-bold tracking-wider uppercase px-4 py-2 rounded-full shadow">Άρθρα που βρέθηκαν</h3>
            </div>
            <div className="flex justify-center mb-4">
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center -space-x-4 hover:space-x-[-12px] transition-all duration-300 ease-in-out group focus:outline-none"
                    aria-label="Εμφάνιση πηγών ειδήσεων"
                >
                    {displayedSources.map((source, index) => {
                        const domain = getDomain(source.uri);
                        if (!domain) return null;
                        const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
                        return (
                            <img
                                key={`${source.uri}-${index}`}
                                src={faviconUrl}
                                alt={`Favicon for ${domain}`}
                                className="w-12 h-12 bg-white rounded-full border-2 border-stone-100 shadow-lg object-contain transition-all duration-300"
                                style={{ zIndex: displayedSources.length - index }}
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        );
                    })}
                </button>
            </div>
             <p className="text-sm text-stone-500">Κάντε κλικ για να δείτε τις {sources.length} πηγές</p>
        </div>
    );
};

export default SourceList;