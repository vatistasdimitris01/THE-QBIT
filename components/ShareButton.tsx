import React, { useState } from 'react';
import type { Briefing } from '../types';

interface ShareButtonProps {
    briefing: Briefing;
}

const ShareButton: React.FC<ShareButtonProps> = ({ briefing }) => {
    const [shareState, setShareState] = useState<'idle' | 'loading' | 'copied'>('idle');

    const handleShare = async () => {
        setShareState('loading');
        
        try {
            // 1. Get the shareable link from the backend
            const response = await fetch('/api/share/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(briefing),
            });

            if (!response.ok) {
                throw new Error('Failed to create share link.');
            }

            const { shareId } = await response.json();
            const shareUrl = `${window.location.origin}/?share=${shareId}`;

            // 2. Use the Web Share API or fallback to clipboard
            const shareData = {
                title: 'THE QBIT | Daily News Briefing',
                text: 'Το μόνο που χρειάζεσαι να διαβάσεις σήμερα, από το THE QBIT.',
                url: shareUrl,
            };

            if (navigator.share) {
                await navigator.share(shareData);
                setShareState('idle'); // Reset after successful share
            } else {
                navigator.clipboard.writeText(shareUrl);
                setShareState('copied');
                setTimeout(() => setShareState('idle'), 2000);
            }

        } catch (err) {
            console.error("Error creating share link:", err);
            setShareState('idle');
        }
    };

    const getButtonContent = () => {
        switch (shareState) {
            case 'loading':
                return 'Δημιουργία...';
            case 'copied':
                return 'Αντιγράφηκε!';
            case 'idle':
            default:
                return 'Μοιραστείτε';
        }
    };

    return (
        <button
            onClick={handleShare}
            disabled={shareState === 'loading'}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-stone-600 bg-stone-100 border border-stone-300 rounded-full hover:bg-stone-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
            aria-label="Share this article"
        >
            {shareState !== 'loading' && (
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
            )}
            <span>{getButtonContent()}</span>
        </button>
    );
};

export default ShareButton;