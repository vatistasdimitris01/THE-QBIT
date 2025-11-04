import React, { useState } from 'react';

const ShareButton: React.FC = () => {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        const shareData = {
            title: 'THE QBIT | Daily News Briefing',
            text: 'Το μόνο που χρειάζεσαι να διαβάσεις σήμερα.',
            url: window.location.href,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error("Error sharing:", err);
            }
        } else {
            // Fallback to copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-stone-600 bg-stone-100 border border-stone-300 rounded-full hover:bg-stone-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            aria-label="Share this article"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            <span>{copied ? 'Αντιγράφηκε!' : 'Μοιραστείτε'}</span>
        </button>
    );
};

export default ShareButton;
