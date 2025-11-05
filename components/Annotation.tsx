import React, { useState, useRef, useEffect } from 'react';
import type { Story } from '../types';

interface AnnotationProps {
  term: string;
  explanation?: string;
  importance: number;
  crossLinkStoryTitle?: string;
  allStories: Story[];
}

const StoryPreview: React.FC<{ story: Story; onClose: () => void }> = ({ story, onClose }) => {
    return (
        <div className="my-3 pl-4 relative border-l-4 border-blue-500 bg-blue-50/50 p-4 rounded-r-md">
            <button onClick={onClose} className="absolute top-1 right-1 text-blue-400 hover:text-blue-600" aria-label="Close preview">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Σχετική Είδηση</p>
            <h4 className="font-semibold font-serif text-blue-900 mt-1 mb-2">{story.title}</h4>
            <p className="text-sm text-stone-700 italic">
                {story.summary.split('\n')[0].substring(0, 150)}...
            </p>
        </div>
    );
};

const Annotation: React.FC<AnnotationProps> = ({ term, explanation, importance, crossLinkStoryTitle, allStories }) => {
  const [isOpen, setIsOpen] = useState(false);
  const linkedStory = crossLinkStoryTitle ? allStories.find(s => s.title === crossLinkStoryTitle) : undefined;

  const hasContent = (explanation && explanation.trim() !== '') || linkedStory;

  const toggleOpen = () => {
    if (hasContent) {
      setIsOpen(!isOpen);
    }
  };
  
  const importanceStyles: { [key: number]: string } = {
    1: 'border-orange-400/60',
    2: 'border-orange-500/80 border-b-[2px]',
    3: 'border-orange-600 border-b-[3px]',
  };

  const crossLinkStyles = linkedStory ? 'border-blue-500/80 !border-b-[2px]' : '';
  const baseClasses = 'border-b transition-colors duration-200';
  const hoverClasses = hasContent ? 'hover:border-orange-500' : '';
  const cursorClass = hasContent ? 'cursor-pointer' : 'cursor-text';
  
  const finalClasses = `${baseClasses} ${crossLinkStyles || importanceStyles[importance] || importanceStyles[1]} ${hoverClasses} ${cursorClass}`;

  return (
    <>
      <span
        onClick={toggleOpen}
        onKeyPress={(e) => e.key === 'Enter' && toggleOpen()}
        role="button"
        tabIndex={0}
        className={`inline-flex items-baseline ${finalClasses} ${
          isOpen && linkedStory ? 'text-blue-800' : ''
        } ${
          isOpen && !linkedStory ? 'text-orange-800' : ''
        }`}
        aria-expanded={isOpen}
      >
        {term}
        {!linkedStory && hasContent && (
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none" stroke="currentColor" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" className="inline-block ml-1 mb-0.5 w-3 h-3 opacity-60">
                <rect x="32" y="32" width="60" height="448" rx="6" ry="6"></rect>
                <rect x="148" y="32" width="100" height="448" rx="6" ry="6"></rect>
                <rect x="304" y="32" width="160" height="448" rx="6" ry="6"></rect>
            </svg>
        )}
        {linkedStory && (
            <svg xmlns="http://www.w3.org/2000/svg" className="inline-block ml-1 mb-0.5 w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
        )}
      </span>
      {isOpen && linkedStory && <StoryPreview story={linkedStory} onClose={() => setIsOpen(false)} />}
      {isOpen && !linkedStory && explanation && (
        <div className="my-3 pl-4 relative border-l-4 border-orange-400">
          <p className="text-base text-stone-700 italic">
            {explanation}
          </p>
        </div>
      )}
    </>
  );
};

export default Annotation;