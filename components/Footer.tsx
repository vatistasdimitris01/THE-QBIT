
import React, { useState, useEffect } from 'react';

// This is a placeholder VAPID public key.
// In a real-world application, you would generate your own VAPID keys
// and store the public key in your frontend and the private key securely on your server.
const VAPID_PUBLIC_KEY = 'YOUR_VAPID_PUBLIC_KEY_HERE';

const Footer: React.FC = () => {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isSubscribing, setIsSubscribing] = useState(false);
    const [notificationPermission, setNotificationPermission] = useState('default');

    useEffect(() => {
        if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
            return;
        }

        setNotificationPermission(Notification.permission);

        navigator.serviceWorker.ready.then(registration => {
            registration.pushManager.getSubscription().then(subscription => {
                if (subscription) {
                    setIsSubscribed(true);
                }
            });
        });
    }, []);

    const handleSubscribe = async () => {
        if (isSubscribed || notificationPermission !== 'default') {
            return;
        }

        setIsSubscribing(true);

        try {
            const permission = await Notification.requestPermission();
            setNotificationPermission(permission);

            if (permission === 'granted') {
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    // In a real app, you would get this key from your server
                    // applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) 
                });
                
                // TODO: In a real app, send this subscription object to your server
                // await fetch('/api/subscribe', {
                //     method: 'POST',
                //     body: JSON.stringify(subscription),
                //     headers: { 'Content-Type': 'application/json' }
                // });

                console.log('User is subscribed:', subscription);
                setIsSubscribed(true);
            }
        } catch (error) {
            console.error('Failed to subscribe the user: ', error);
        } finally {
            setIsSubscribing(false);
        }
    };

    const renderSubscriptionButton = () => {
        if (notificationPermission === 'denied') {
            return (
                 <div>
                    <button 
                        disabled
                        className="p-3 w-full sm:w-auto bg-stone-400 text-stone-50 font-bold tracking-wider uppercase cursor-not-allowed"
                    >
                        Οι ειδοποιήσεις έχουν αποκλειστεί
                    </button>
                    <p className="text-xs text-stone-500 mt-2">
                        Πρέπει να ενεργοποιήσετε τις ειδοποιήσεις στις ρυθμίσεις του προγράμματος περιήγησης.
                    </p>
                </div>
            );
        }

        if (isSubscribed) {
            return (
                <button 
                    disabled
                    className="p-3 w-full sm:w-auto bg-green-700 text-white font-bold tracking-wider uppercase flex items-center justify-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Έχετε εγγραφεί
                </button>
            );
        }

        return (
            <button 
                onClick={handleSubscribe}
                disabled={isSubscribing}
                className="p-3 w-full sm:w-auto bg-stone-50 text-stone-900 font-bold tracking-wider uppercase hover:bg-stone-300 transition-colors disabled:bg-stone-300"
            >
                {isSubscribing ? 'Επεξεργασία...' : 'Ενεργοποίηση Ειδοποιήσεων'}
            </button>
        );
    }

  return (
    <footer className="bg-stone-900 text-stone-200 mt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
            <h2 className="text-2xl font-serif mb-2">Μείνετε πάντα ενήμεροι.</h2>
            <p className="text-stone-400 mb-6 max-w-md mx-auto">Λάβετε το καθημερινό QBIT και τις έκτακτες ειδήσεις απευθείας στη συσκευή σας.</p>
            <div className="max-w-md mx-auto">
                {renderSubscriptionButton()}
            </div>
        </div>
        <div className="mt-12 pt-8 border-t border-stone-700 text-center text-xs text-stone-500">
            <p>&copy; {new Date().getFullYear()} THE QBIT. Με επιφύλαξη παντός δικαιώματος. Εμπνευσμένο από το tobrief.gr.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;