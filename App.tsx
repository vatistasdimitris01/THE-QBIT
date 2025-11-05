
import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import NewsBriefing from './components/NewsBriefing';
import GenerationScreen from './components/LoadingSpinner';
import { getDailyBriefing } from './services/geminiService';
import type { Briefing } from './types';

type AppStatus = 'loading' | 'error' | 'success';
type Location = { lat: number, lon: number } | null;

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>('loading');
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [loadTime, setLoadTime] = useState<number | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [country, setCountry] = useState<string | null>('Ελλάδα');
  const [location, setLocation] = useState<Location>(null);
  const [isLocationReady, setIsLocationReady] = useState(false);

  useEffect(() => {
    // Get user's location once on initial load.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
          setIsLocationReady(true);
        },
        () => {
          console.warn("Location access denied. Proceeding without weather.");
          setLocation(null);
          setIsLocationReady(true);
        },
        { timeout: 5000 }
      );
    } else {
      setIsLocationReady(true); // Geolocation not supported, proceed without it.
    }
  }, []);

  const loadNews = useCallback(async (newCountry: string | null) => {
    // Don't load news until the location attempt is complete.
    if (!isLocationReady) return;

    setStatus('loading');
    setBriefing(null);
    setError(null);
    setLoadTime(null);
    setLoadingMessage(newCountry ? `Δημιουργία ενημέρωσης για την ${newCountry}...` : "Δημιουργία παγκόσμιας ενημέρωσης...");

    const startTime = performance.now();
    try {
      const { briefing: fetchedBriefing } = await getDailyBriefing(new Date(), newCountry, location);
      
      if (!fetchedBriefing.content.stories || fetchedBriefing.content.stories.length === 0) {
        setError("Δεν βρέθηκαν ειδήσεις για σήμερα. Παρακαλώ δοκιμάστε ξανά αργότερα.");
        setStatus('error');
      } else {
        setBriefing(fetchedBriefing);
        setStatus('success');
        
        // If the user is not looking at the page, send a notification that the news is ready.
        if (document.visibilityState === 'hidden' && 'Notification' in window && Notification.permission === 'granted') {
            navigator.serviceWorker.ready.then(registration => {
                const options = {
                    body: 'Η καθημερινή σας σύνοψη ειδήσεων είναι έτοιμη. Κάντε κλικ για να τη δείτε.',
                    icon: '/favicon.svg',
                    tag: 'news-ready' // Use a tag to prevent duplicate notifications
                };
                registration.showNotification('Η ενημέρωσή σας είναι εδώ!', options);
            });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Προέκυψε ένα άγνωστο σφάλμα.");
      setStatus('error');
    } finally {
        const endTime = performance.now();
        setLoadTime(Math.round(endTime - startTime));
    }
  }, [isLocationReady, location]);
  
  useEffect(() => {
    const setupServiceWorker = () => {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        // Construct the full URL to the service worker to avoid cross-origin issues
        // in certain sandboxed environments.
        const serviceWorkerUrl = new URL('/service-worker.js', window.location.origin).href;
        navigator.serviceWorker.register(serviceWorkerUrl)
          .then(swReg => {
            console.log('Service Worker is registered', swReg);
          })
          .catch(error => {
            console.error('Service Worker Error', error);
          });
      }
    };
    
    setupServiceWorker();
  }, []);

  useEffect(() => {
    // This effect runs when isLocationReady becomes true, or when the country changes.
    loadNews(country);
  }, [country, loadNews]);


  const handleCountryChange = (newCountry: string | null) => {
    setCountry(newCountry);
  };

  const renderContent = () => {
    if (status === 'loading') {
        return <GenerationScreen message={loadingMessage} />;
    }
    
    if (status === 'error') {
        return (
            <div className="text-center py-20 px-4 max-w-2xl mx-auto">
                <h2 className="text-2xl font-serif mb-4 text-red-700">Κάτι πήγε στραβά</h2>
                <p className="text-stone-600 mb-8">{error || 'Προέκυψε ένα μη αναμενόμενο σφάλμα.'}</p>
                <button
                    onClick={() => loadNews(country)}
                    className="px-8 py-3 bg-stone-900 text-stone-50 font-bold tracking-wider uppercase hover:bg-stone-700 transition-colors"
                >
                    Δοκιμάστε Ξανά
                </button>
            </div>
        );
    }

    if (status === 'success' && briefing) {
        return <NewsBriefing briefing={briefing} loadTime={loadTime} />;
    }
    
    return null;
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Header 
        country={country}
        onCountryChange={handleCountryChange}
        weather={briefing?.content.weather}
        localTime={briefing?.content.localTime}
      />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 flex-grow w-full">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
};

export default App;