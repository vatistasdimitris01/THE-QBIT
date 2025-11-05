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

    const allAnnotations = useMemo(() => 
        content.stories?.flatMap(story => story.annotations || []) || [], 
    [content.stories]);


    const renderAnnotationsSidebar = (annotations: AnnotationType[]) => {
        if (!annotations || annotations.length === 0) return null;

        const sortedAnnotations = [...annotations].sort((a, b) => {
            if (b.importance !== a.importance) return b.importance - a.importance;
            return a.term.localeCompare(b.term);
        });

        return (
            <div>
                <h3 className="text-lg font-semibold font-serif text-stone-800 mb-4">Βασικοί Όροι</h3>
                <div className="flex flex-wrap gap-2">
                    {sortedAnnotations.map((anno, i) => (
                        <span key={`${anno.term}-${i}`} className={`text-sm px-2 py-1 rounded-md ${
                            anno.importance === 3 ? 'bg-orange-200 text-orange-900 font-medium ring-1 ring-inset ring-orange-300' :
                            anno.importance === 2 ? 'bg-orange-100 text-orange-800' :
                            'bg-stone-200 text-stone-700'
                        }`} title={anno.explanation}>
                            {anno.term}
                        </span>
                    ))}
                </div>
            </div>
        );
    };
    
    return (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            
            {/* Main Content Column */}
            <div className="lg:col-span-2">
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

                <p className="text-center text-lg text-stone-700 mt-12 mb-16">{content.outro}</p>
                
                <div className="flex justify-center relative">
                    <ShareButton />
                    {showLoadTime && loadTime && (
                        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full whitespace-nowrap">
                            Φορτώθηκε σε {loadTime}ms
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar Column */}
            <aside className="lg:col-span-1 lg:sticky lg:top-24 h-fit space-y-10">
                {renderAnnotationsSidebar(allAnnotations)}
                {sources && sources.length > 0 && (
                     <SourceList sources={sources} />
                )}
            </aside>
        </div>
    );
};

export default NewsBriefing;