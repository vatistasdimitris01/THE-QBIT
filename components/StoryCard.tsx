import React from 'react';
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

const MediaDisplay: React.FC<{ story: Story }> = ({ story }) => {
    if (!story.media) {
        return <div className="mb-6 text-sm text-center italic text-stone-500 py-2 border-b border-stone-200">Χωρίς πολυμέσα</div>;
    }

    switch (story.media.type) {
        case 'image':
            return (
                <div className="mb-6 rounded-lg overflow-hidden border border-stone-200">
                    <img src={story.media.src} alt={story.title} className="w-full h-auto object-cover" />
                </div>
            );
        case 'youtube':
            return (
                <div className="mb-6 video-container rounded-lg overflow-hidden border border-stone-200">
                    <iframe
                        src={`https://www.youtube.com/embed/${story.media.videoId}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={story.title}
                    ></iframe>
                </div>
            );
        default:
            return <div className="mb-6 text-sm text-center italic text-stone-500 py-2 border-b border-stone-200">Χωρίς πολυμέσα</div>;
    }
}

const StoryCard: React.FC<StoryCardProps> = ({ story, allStories }) => {
  return (
    <article>
        <MediaDisplay story={story} />
        <h2 className="text-2xl font-bold font-serif text-stone-900 mb-4">{story.title}</h2>
        <div className="text-base leading-relaxed text-stone-700">
            {renderSummaryWithAnnotations(story, allStories)}
        </div>
    </article>
  );
};

export default StoryCard;