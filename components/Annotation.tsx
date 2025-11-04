import React, { useState } from 'react';

interface AnnotationProps {
  term: string;
  explanation: string;
}

const Annotation: React.FC<AnnotationProps> = ({ term, explanation }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <span
        onClick={toggleOpen}
        onKeyPress={(e) => e.key === 'Enter' && toggleOpen()}
        role="button"
        tabIndex={0}
        className={`inline-flex items-baseline border-b-2 transition-colors duration-200 cursor-pointer ${
          isOpen ? 'border-orange-500/80 text-orange-800' : 'border-orange-500/40 hover:border-orange-500/80'
        }`}
        aria-expanded={isOpen}
      >
        {term}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none" stroke="currentColor" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" className="inline-block ml-1 mb-0.5 w-3 h-3 opacity-60">
            <rect x="32" y="32" width="60" height="448" rx="6" ry="6"></rect>
            <rect x="148" y="32" width="100" height="448" rx="6" ry="6"></rect>
            <rect x="304" y="32" width="160" height="448" rx="6" ry="6"></rect>
        </svg>
      </span>
      {isOpen && (
        <div className="my-4 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-400 rounded-full"></div>
          <div className="pl-6 text-base text-stone-800 bg-orange-100/30 p-4 border border-orange-200/50 rounded-r-md">
            {explanation}
          </div>
        </div>
      )}
    </>
  );
};

export default Annotation;
