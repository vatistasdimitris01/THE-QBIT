import React from 'react';
import type { Story } from '../types';
import Annotation from './Annotation';

interface StoryCardProps {
  story: Story;
}

const renderSummaryWithAnnotations = (story: Story) => {
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
                                newResult.push(<Annotation key={`${story.id}-${anno.term}-${i}`} term={anno.term} explanation={anno.explanation} />);
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

const StoryCard: React.FC<StoryCardProps> = ({ story }) => {
  return (
    <article className="bg-white/50 rounded-lg shadow-sm ring-1 ring-stone-200/50 p-6 md:p-8">
        <p className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-2">{story.category}</p>
        <h2 className="text-3xl font-semibold font-serif text-stone-900 mb-4">{story.title}</h2>
        <div className="text-lg leading-relaxed text-stone-700">
            {renderSummaryWithAnnotations(story)}
        </div>
    </article>
  );
};

export default StoryCard;
