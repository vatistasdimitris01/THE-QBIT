import React, { useEffect, useState, useMemo } from 'react';
import type { Briefing, Annotation as AnnotationType } from '../types';
import ShareButton from './ShareButton';
import SourceList from './SourceList';
import StoryCard from './StoryCard';

interface NewsBriefingProps {
  briefing: Briefing;
  loadTime: number | null;
}

const NewsBriefing: React.FC<NewsBriefingProps> = ({ briefing, loadTime }) => {
    const { content, sources } = briefing;
    const [showLoadTime, setShowLoadTime] = useState(false);

    useEffect(() => {
        if (loadTime !== null) {
            setShowLoadTime(true);
            const timer = setTimeout(() => {
                setShowLoadTime(false);
            }, 3000); // Hide after 3 seconds
            return () => clearTimeout(timer);
        }
    }, [loadTime]);

    return (
        <div className="max-w-3xl mx-auto">
            
            <header className="mb-12">
                <h1 className="text-4xl md:text-5xl font-serif mb-2 text-stone-900">{content.greeting}</h1>
                <p className="text-lg text-stone-600 mb-6">{content.intro}</p>
                <p className="text-base text-stone-800 leading-relaxed">{content.dailySummary}</p>
            </header>

            <main className="space-y-12">
                {content.stories.map((story) => (
                    <StoryCard key={story.id} story={story} />
                ))}
            </main>

            <footer className="mt-16 pt-8 border-t border-stone-200">
                <p className="text-center text-lg text-stone-700 mb-8">{content.outro}</p>
                
                <div className="flex justify-center relative mb-12">
                    <ShareButton />
                    {showLoadTime && loadTime && (
                        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full whitespace-nowrap">
                            Φορτώθηκε σε {loadTime}ms
                        </div>
                    )}
                </div>
                
                {sources && sources.length > 0 && (
                     <SourceList sources={sources} />
                )}
            </footer>
        </div>
    );
};

export default NewsBriefing;