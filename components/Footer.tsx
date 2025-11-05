
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-stone-200 mt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
            <h2 className="text-2xl font-serif mb-2">Μείνετε πάντα ενήμεροι.</h2>
            <p className="text-stone-400 mb-6 max-w-md mx-auto">Η καθημερινή σας ενημέρωση για τις ειδήσεις που έχουν σημασία, με την ταχύτητα της τεχνητής νοημοσύνης.</p>
        </div>
        <div className="mt-12 pt-8 border-t border-stone-700 text-center text-xs text-stone-500">
            <p>&copy; {new Date().getFullYear()} THE QBIT. Με επιφύλαξη παντός δικαιώματος. Εμπνευσμένο από το tobrief.gr.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;