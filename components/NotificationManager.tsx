import React, { useState, useEffect } from 'react';

const NotificationManager: React.FC = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window) || Notification.permission !== 'default') {
      return;
    }
    try {
        const permissionResult = await Notification.requestPermission();
        setPermission(permissionResult);
        if (permissionResult === 'granted') {
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
    return null;
  }

  const renderContent = () => {
    switch (permission) {
      case 'granted':
        return (
          <div
            className="text-sm text-stone-400"
            title="Οι ειδοποιήσεις είναι ενεργές."
          >
            Οι ειδοποιήσεις είναι ενεργές
          </div>
        );
      case 'denied':
        return (
          <div className="text-sm text-stone-400" title="Οι ειδοποιήσεις έχουν αποκλειστεί.">
            Ειδοποιήσεις: Αποκλεισμένες
          </div>
        );
      default: // 'default'
        return (
          <button
            onClick={requestPermission}
            className="text-sm text-stone-400 hover:text-white transition-colors underline focus:outline-none"
          >
            Λήψη ειδοποιήσεων
          </button>
        );
    }
  };

  return (
    <div className="mt-6">
        {renderContent()}
    </div>
  )
};

export default NotificationManager;