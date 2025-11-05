import React, { useState, useEffect } from 'react';

const NotificationBell: React.FC = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Check for notification support and set initial permission status
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    // Double check for support
    if (!('Notification' in window)) {
      alert('Το πρόγραμμα περιήγησης δεν υποστηρίζει ειδοποιήσεις.');
      return;
    }

    // Don't do anything if permission is not 'default'
    if (Notification.permission !== 'default') {
      return;
    }
    
    try {
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult); // Update state with the user's choice

      if (permissionResult === 'granted') {
        // When permission is granted, show a welcome notification
        navigator.serviceWorker.ready.then(registration => {
          const options = {
            body: 'Είστε πλέον μέλος του THE QBIT. Θα λαμβάνετε ειδοποιήσεις για σημαντικές ενημερώσεις.',
            icon: '/favicon.svg',
            tag: 'welcome-notification'
          };
          registration.showNotification('Οι ειδοποιήσεις ενεργοποιήθηκαν!', options);
        });
      }
    } catch (error) {
        console.error("Σφάλμα κατά την αίτηση άδειας για ειδοποιήσεις:", error);
    }
  };

  if (!('Notification' in window)) {
    return null; // Don't render anything if notifications are not supported
  }
  
  if (permission === 'granted') {
      return (
           <div className="flex items-center p-2" title="Οι ειδοποιήσεις είναι ενεργές">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
               </svg>
           </div>
      );
  }

  if (permission === 'denied') {
      return (
           <div className="flex items-center p-2" title="Οι ειδοποιήσεις είναι απενεργοποιημένες. Αλλάξτε τις ρυθμίσεις του browser για να τις ενεργοποιήσετε.">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
           </div>
      );
  }

  // Render the button if permission is 'default'
  return (
    <button
      onClick={requestNotificationPermission}
      className="flex items-center text-stone-700 hover:text-stone-900 transition-colors focus:outline-none p-2 rounded-full hover:bg-stone-200/50"
      aria-label="Ενεργοποίηση ειδοποιήσεων"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    </button>
  );
};

export default NotificationBell;
