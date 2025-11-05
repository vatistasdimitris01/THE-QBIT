import React, { useState } from 'react';
import type { StorySource } from '../types';

interface SourceListProps {
    sources: StorySource[];
}

const SourceList: React.FC<SourceListProps> = ({ sources }) => {
    const [isOpen, setIsOpen] = useState(false);

    const getDomain = (uri: string): string | null => {
        try {
            return new URL(uri).hostname.replace(/^www\./, '');
        } catch (e) {
            return null;
        }
    };

    if (!sources || sources.length === 0) {
        return null;
    }

    if (!isOpen) {
        return (
            <div className="text-center">
                <button
                    onClick={() => setIsOpen(true)}
                    className="inline-flex flex-col items-center gap-3 text-stone-600 hover:text-stone-900 transition-colors group"
                    aria-label={`Εμφάνιση ${sources.length} πηγών`}
                >
                    <div className="flex items-center justify-center">
                        {sources.slice(0, 5).map((source, index) => {
                            const domain = getDomain(source.uri);
                            if (!domain) return null;
                            const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
                            return (
                                <img
                                    key={`${source.uri}-${index}`}
                                    src={faviconUrl}
                                    alt={`Favicon for ${domain}`}
                                    className="w-8 h-8 rounded-full bg-white border-2 border-stone-50 shadow-md object-contain group-hover:border-stone-200 transition-all"
                                    style={{ marginLeft: index > 0 ? '-12px' : 0, zIndex: 5 - index }}
                                    width="32"
                                    height="32"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            );
                        })}
                    </div>
                    <span className="text-sm font-medium tracking-wide underline decoration-stone-300 group-hover:decoration-stone-400 underline-offset-2">
                        Προβολή {sources.length} πηγών
                    </span>
                </button>
            </div>
        );
    }

    return (
        <div className="border border-stone-200 rounded-lg p-4">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold font-serif text-stone-800">Πηγές Ειδήσεων</h3>
                <button 
                    onClick={() => setIsOpen(false)}
                    className="text-sm font-medium text-stone-500 hover:text-stone-800"
                    aria-label="Απόκρυψη πηγών"
                >
                    Απόκρυψη
                </button>
            </div>
            <ul className="space-y-2">
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
                                className="flex items-center gap-3 p-2 bg-white/0 hover:bg-stone-100 rounded-lg transition-colors duration-200"
                            >
                                <img 
                                    src={faviconUrl} 
                                    alt={`Favicon for ${domain}`}
                                    className="w-6 h-6 flex-shrink-0 bg-white rounded border border-stone-200 p-0.5 object-contain"
                                    width="24"
                                    height="24"
                                    onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2U1ZTdlYiI+PHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6Ij48L3BhdGg+PC9zdmc+`;
                                    }}
                                />
                                <div className="overflow-hidden">
                                    <p className="text-sm font-medium text-stone-800 truncate" title={source.title}>
                                        {source.title}
                                    </p>
                                    <p className="text-xs text-stone-500">
                                        {domain}
                                    </p>
                                </div>
                            </a>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default SourceList;