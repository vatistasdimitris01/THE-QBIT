
import React, { useState, useEffect } from 'react';
import type { Story } from '../types';
import Annotation from './Annotation';

interface StoryCardProps {
  story: Story;
  allStories: Story[];
}

const renderSummaryWithAnnotations = (story: Story, allStories: Story[]) => {
    const { summary, annotations } = story;
    if (!annotations || annotations.length === 0) {
        return summary.split('\n').filter(p => p.trim() !== '').map((p, i) => <p key={i} className="mb-4 last:mb-0">{p}</p>);
    }

    return summary.split('\n').filter(p => p.trim() !== '').map((paragraph, pIndex) => {
        let annotatedParagraph: (string | React.ReactElement)[] = [paragraph];
        
        annotations.forEach((anno) => {
            if (paragraph.includes(anno.term)) {
                const newResult: (string | React.ReactElement)[] = [];
                annotatedParagraph.forEach(part => {
                    if (typeof part === 'string') {
                        const splitParts = part.split(anno.term);
                        for (let i = 0; i < splitParts.length; i++) {
                            newResult.push(splitParts[i]);
                            if (i < splitParts.length - 1) {
                                newResult.push(
                                    <Annotation 
                                        key={`${story.id}-${anno.term}-${i}`} 
                                        term={anno.term} 
                                        explanation={anno.explanation} 
                                        importance={anno.importance}
                                        crossLinkStoryTitle={anno.crossLinkStoryTitle}
                                        allStories={allStories}
                                    />
                                );
                            }
                        }
                    } else {
                        newResult.push(part);
                    }
                });
                annotatedParagraph = newResult;
            }
        });
        return <p key={pIndex} className="mb-4 last:mb-0">{annotatedParagraph}</p>;
    });
};

const StoryCard: React.FC<StoryCardProps> = ({ story, allStories }) => {
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        setImageError(false);
    }, [story.media?.src]);

    const MediaDisplay: React.FC = () => {
        if (!story.media) return null;

        const { media } = story;
        const altText = media.alt || story.title;

        switch (media.type) {
            case 'image':
                if (imageError || !media.src) {
                    return (
                        <div className="mb-6 aspect-[16/9] bg-blue-50 flex items-center justify-center text-center p-4 rounded-lg">
                            <div className="text-blue-800/70">
                                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                                <p className="font-semibold mt-2 text-sm">Η εικόνα δεν είναι πλέον διαθέσιμη.</p>
                                <p className="text-xs">Ζητούμε συγγνώμη.</p>
                            </div>
                        </div>
                    );
                }
                return (
                    <div className="mb-6">
                        <img 
                            src={media.src} 
                            alt={altText} 
                            className="w-full h-auto object-cover rounded-lg" 
                            onError={() => setImageError(true)} 
                        />
                        {media.credit && (
                            <p className="text-xs text-stone-500 mt-2 text-right pr-1">
                                Πηγή: {media.credit}
                            </p>
                        )}
                    </div>
                );
            case 'youtube':
                return (
                    <div className="mb-6 video-container">
                        <iframe
                            src={`https://www.youtube.com/embed/${media.videoId}`}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title={altText}
                        ></iframe>
                    </div>
                );
            default:
                return null;
        }
    }

  return (
    <article>
        {story.media?.alt && (
          <p className="text-sm text-stone-500 mb-2">{story.media.alt}</p>
        )}
        <h2 className="text-2xl font-bold font-serif text-stone-900 mb-4">{story.title}</h2>
        <MediaDisplay />
        <div className="text-base leading-relaxed text-stone-700">
            {renderSummaryWithAnnotations(story, allStories)}
        </div>
    </article>
  );
};

export default StoryCard;