import React, { useEffect, useState, useRef, useCallback } from 'react';
import type { Briefing } from '../types';
import ShareButton from './ShareButton';
import SourceList from './SourceList';
import StoryCard from './StoryCard';
import ScrollProgressIndicator from './ScrollProgressIndicator';

interface NewsBriefingProps {
  briefing: Briefing;
  loadTime: number | null;
}

const NewsBriefing: React.FC<NewsBriefingProps> = ({ briefing, loadTime }) => {
    const { content, sources } = briefing;
    const [showLoadTime, setShowLoadTime] = useState(false);
    const [storiesLeft, setStoriesLeft] = useState(() => briefing.content.stories.length);
    const [showIndicator, setShowIndicator] = useState(false);
    const [indicatorDismissed, setIndicatorDismissed] = useState(false);
    const storyRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        if (loadTime !== null) {
            setShowLoadTime(true);
            const timer = setTimeout(() => {
                setShowLoadTime(false);
            }, 3000); // Hide after 3 seconds
            return () => clearTimeout(timer);
        }
    }, [loadTime]);

    // Reset indicator state when a new briefing is loaded
    useEffect(() => {
        setIndicatorDismissed(false);
        setStoriesLeft(briefing.content.stories.length);
    }, [briefing]);

    const handleScroll = useCallback(() => {
        if (indicatorDismissed) {
            if (showIndicator) setShowIndicator(false); // Ensure it's hidden if dismissed
            return;
        }

        const storiesTotal = briefing.content.stories.length;
        if (storiesTotal === 0) return;

        const checkPoint = window.innerHeight * 0.4; // 40% from the top of the viewport

        let firstVisibleIndex = storyRefs.current.findIndex(ref => ref && ref.getBoundingClientRect().bottom > checkPoint);

        if (firstVisibleIndex === -1) {
            // All stories are above the checkpoint, so we're at the end
            setStoriesLeft(0);
            setShowIndicator(false);
            setIndicatorDismissed(true); // Dismiss it permanently for this session
            return;
        }

        const numStoriesLeft = storiesTotal - firstVisibleIndex;
        setStoriesLeft(numStoriesLeft);
        setShowIndicator(numStoriesLeft > 0 && numStoriesLeft <= 4);
        
    }, [briefing.content.stories.length, indicatorDismissed, showIndicator]);

    useEffect(() => {
        handleScroll(); // Check position on initial render
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    return (
        <div className="max-w-3xl mx-auto">
            
            <header className="mb-12">
                <h1 className="text-4xl md:text-5xl font-serif mb-2 text-stone-900">{content.greeting}</h1>
                <p className="text-lg text-stone-600 mb-6">{content.intro}</p>
                <p className="text-base text-stone-800 leading-relaxed">{content.dailySummary}</p>
            </header>

            <main className="space-y-12">
                {content.stories.map((story, index) => (
                    <div key={story.id} ref={el => { storyRefs.current[index] = el; }}>
                        <StoryCard story={story} />
                    </div>
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
            
            <ScrollProgressIndicator storiesLeft={storiesLeft} isVisible={showIndicator} />
        </div>
    );
};

export default NewsBriefing;