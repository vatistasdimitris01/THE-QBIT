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

    const categoryOrder = ['Πολιτική', 'Οικονομία', 'Κόσμος', 'Κοινωνία', 'Αθλητισμός', 'Τεχνολογία', 'Lifestyle'];

    const sortedStories = useMemo(() => {
        if (!content.stories) return [];
        return [...content.stories].sort((a, b) => {
            const indexA = categoryOrder.indexOf(a.category);
            const indexB = categoryOrder.indexOf(b.category);

            // Handle cases where a category might not be in our predefined list
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            
            // Sort by category order first
            if (indexA !== indexB) {
                return indexA - indexB;
            }

            // Then, sort by importance (descending) within the same category
            return b.importance - a.importance;
        });
    }, [content.stories]);
    
    return (
        <div className="max-w-3xl mx-auto">
            
            <header className="text-center mb-12">
                <p className="text-xl text-stone-600">{content.greeting}</p>
                <h1 className="text-3xl md:text-4xl font-serif my-2 text-stone-900">{content.intro}</h1>
                <p className="text-sm text-stone-500">{content.timestamp}</p>
            </header>

            <main className="space-y-12">
                {sortedStories.map((story) => (
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