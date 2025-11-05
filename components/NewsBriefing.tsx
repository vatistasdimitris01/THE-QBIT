import React, { useEffect, useState } from 'react';
import type { Briefing } from '../types';
import ShareButton from './ShareButton';
import Annotation from './Annotation';
import SourceList from './SourceList';

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

    const renderBody = (body: string, annotations?: Briefing['content']['annotations']) => {
        return body.split('\n\n').map((paragraph, pIdx) => {
            const trimmedParagraph = paragraph.trim();

            if (trimmedParagraph.startsWith('### ')) {
                return <h3 key={pIdx} className="text-2xl font-semibold font-serif text-stone-900 mt-8 mb-4">{trimmedParagraph.substring(4)}</h3>;
            }

            if (!trimmedParagraph) {
                return null;
            }

            if (!annotations || annotations.length === 0) {
                return <p key={pIdx} className="mb-4 text-lg leading-relaxed text-stone-800">{trimmedParagraph}</p>;
            }

            let annotatedParagraph: (string | React.ReactElement)[] = [trimmedParagraph];

            annotations.forEach((anno) => {
                const newResult: (string | React.ReactElement)[] = [];
                annotatedParagraph.forEach((part) => {
                    if (typeof part === 'string' && part.includes(anno.term)) {
                        const splitParts = part.split(anno.term);
                        for (let i = 0; i < splitParts.length; i++) {
                            newResult.push(splitParts[i]);
                            if (i < splitParts.length - 1) {
                                newResult.push(<Annotation key={`${pIdx}-${anno.term}-${i}`} term={anno.term} explanation={anno.explanation} importance={anno.importance} />);
                            }
                        }
                    } else {
                        newResult.push(part);
                    }
                });
                annotatedParagraph = newResult;
            });

            return <p key={pIdx} className="mb-4 text-lg leading-relaxed text-stone-800">{annotatedParagraph}</p>;
        });
    };
    
    return (
        <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
                <p className="text-xl text-stone-600">{content.greeting}</p>
                <h1 className="text-3xl md:text-4xl font-serif my-2 text-stone-900">{content.intro}</h1>
                <p className="text-sm text-stone-500">{content.timestamp}</p>
            </div>

            <article className="prose prose-stone lg:prose-lg max-w-none">
                {renderBody(content.body, content.annotations)}
            </article>

            <p className="text-center text-lg text-stone-700 mt-12 mb-16">{content.outro}</p>
            
            <div className="text-center relative">
                <ShareButton />
                {showLoadTime && loadTime && (
                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full whitespace-nowrap">
                        Φορτώθηκε σε {loadTime}ms
                    </div>
                )}
            </div>

            {sources && sources.length > 0 && (
                <div className="mt-24 pt-8 border-t border-stone-200">
                    <SourceList sources={sources} />
                </div>
            )}
        </div>
    );
};

export default NewsBriefing;