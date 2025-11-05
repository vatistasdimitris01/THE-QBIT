import React from 'react';
import type { StorySource } from '../types';

interface SourceListProps {
    sources: StorySource[];
}

const SourceList: React.FC<SourceListProps> = ({ sources }) => {

    const getDomain = (uri: string): string | null => {
        try {
            return new URL(uri).hostname.replace(/^www\./, '');
        } catch (e) {
            return null;
        }
    };

    return (
        <div>
             <div className="mb-4">
                <h3 className="text-lg font-semibold font-serif text-stone-800">Πηγές Ειδήσεων</h3>
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