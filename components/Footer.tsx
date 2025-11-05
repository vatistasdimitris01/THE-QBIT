
import React from 'react';
import NotificationManager from './NotificationManager';

const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-stone-200 mt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
            <h2 className="text-2xl font-serif mb-2">Μείνετε πάντα ενήμεροι.</h2>
            <p className="text-stone-400 mb-6 max-w-md mx-auto">Η καθημερινή σας ενημέρωση για τις ειδήσεις που έχουν σημασία, με την ταχύτητα της τεχνητής νοημοσύνης.</p>
        </div>
        <div className="mt-12 pt-8 border-t border-stone-700 text-center text-xs text-stone-500">
            <p>&copy; {new Date().getFullYear()} THE QBIT. Με επιφύλαξη παντός δικαιώματος.</p>
            <div className="mt-4 flex justify-center items-center gap-4 text-stone-400 text-sm">
                <span>Made by vatistasdimitris</span>
                <a href="https://www.instagram.com/vatistasdimitris/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                       <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849s-.012 3.584-.069 4.849c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.849-.07c-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849s.013-3.583.07-4.849c.149-3.227 1.664-4.771 4.919-4.919A118.752 118.752 0 0112 2.163M12 0C8.74 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.74 0 12s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.74 24 12 24s3.667-.014 4.947-.072c4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.687.073-4.947s-.014-3.667-.072-4.947c-.196-4.354-2.617-6.78-6.979-6.98C15.667.014 15.26 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z"/>
                    </svg>
                </a>
                <a href="https://x.com/vatistasdimitris" target="_blank" rel="noopener noreferrer" aria-label="X/Twitter" className="hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                    </svg>
                </a>
            </div>
            <NotificationManager />
        </div>
      </div>
    </footer>
  );
};

export default Footer;