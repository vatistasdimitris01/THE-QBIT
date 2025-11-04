import React, { useEffect, useState } from 'react';
import type { Briefing } from '../types';
import ShareButton from './ShareButton';
import Annotation from './Annotation';

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
                                newResult.push(<Annotation key={`${pIdx}-${anno.term}-${i}`} term={anno.term} explanation={anno.explanation} />);
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
                    <div className="text-center mb-12">
                        <h3 className="inline-block bg-orange-500 text-white text-sm font-bold tracking-wider uppercase px-4 py-2 rounded-full shadow">Άρθρα που βρέθηκαν</h3>
                    </div>
                     <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                        {sources.map((source, index) => {
                           try {
                            const domain = new URL(source.uri).hostname.replace(/^www\./, '');
                            const faviconUrl = `https://${domain}/favicon.ico`;
                            return (
                               <li key={`${source.uri}-${index}`} className="relative group">
                                   <div className="absolute -bottom-1 -right-1 h-full w-full bg-orange-200 rounded-lg transition-transform duration-300 ease-in-out group-hover:rotate-3"></div>
                                   <div className="absolute -bottom-2 -right-2 h-full w-full bg-orange-300 rounded-lg transition-transform duration-300 ease-in-out group-hover:rotate-6"></div>
                                   <a 
                                     href={source.uri} 
                                     target="_blank" 
                                     rel="noopener noreferrer" 
                                     className="relative flex items-center gap-4 p-4 bg-white border border-stone-200 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 ease-in-out w-full h-full transform group-hover:-translate-x-1 group-hover:-translate-y-1"
                                   >
                                     <img 
                                         src={faviconUrl} 
                                         alt={`Favicon for ${domain}`}
                                         className="w-10 h-10 flex-shrink-0 bg-white rounded-md border border-stone-200 p-1 object-contain"
                                         width="40"
                                         height="40"
                                         onError={(e) => {
                                            e.currentTarget.onerror = null; // prevents looping
                                            e.currentTarget.src = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2U1ZTdlYiI+PHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6Ij48L3BhdGg+PC9zdmc+`;
                                         }}
                                     />
                                     <div className="overflow-hidden">
                                         <p className="text-base font-medium text-stone-800 truncate" title={source.title}>
                                             {source.title}
                                         </p>
                                         <p className="text-sm text-stone-500">
                                             {domain}
                                         </p>
                                     </div>
                                   </a>
                               </li>
                            )
                           } catch (e) {
                               console.warn("Could not parse source URI:", source.uri);
                               return null;
                           }
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default NewsBriefing;