import React from 'react';
import type { Story, Media } from '../types';
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

const MediaDisplay: React.FC<{ media: Media; altText: string }> = ({ media, altText }) => {
    switch (media.type) {
        case 'image':
            return (
                <div className="mb-6">
                    <img src={media.src} alt={altText} className="w-full h-auto object-cover" />
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

const StoryCard: React.FC<StoryCardProps> = ({ story, allStories }) => {
  return (
    <article>
        {story.media?.alt && (
          <p className="text-sm text-stone-500 mb-2">{story.media.alt}</p>
        )}
        <h2 className="text-2xl font-bold font-serif text-stone-900 mb-4">{story.title}</h2>
        {story.media && <MediaDisplay media={story.media} altText={story.media.alt || story.title} />}
        <div className="text-base leading-relaxed text-stone-700">
            {renderSummaryWithAnnotations(story, allStories)}
        </div>
    </article>
  );
};

export default StoryCard;