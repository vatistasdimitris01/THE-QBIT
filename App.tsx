import React, { useState, useCallback, useEffect, useRef } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import NewsBriefing from './components/NewsBriefing';
import GenerationScreen from './components/LoadingSpinner';
import InitialScreen from './components/InitialScreen';
import { getDailyBriefing } from './services/geminiService';
import type { Briefing, GenerationParams } from './types';

type AppStatus = 'initial' | 'loading' | 'error' | 'success';
type Location = { lat: number, lon: number } | null;

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>('initial');
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [loadTime, setLoadTime] = useState<number | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [country, setCountry] = useState<string | null>('Ελλάδα');
  const [location, setLocation] = useState<Location>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadNews = useCallback(async (params: {
    country: string | null;
    category: string | null;
    date: Date;
    location: Location;
  }) => {
    if (abortControllerRef.current) {
        abortControllerRef.current.abort(); // Abort previous request if any
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setStatus('loading');
    setBriefing(null);
    setError(null);
    setLoadTime(null);
    
    if (params.category) {
        setLoadingMessage(`Δημιουργία ενημέρωσης για ${params.category}...`);
    } else {
        setLoadingMessage(params.country ? `Δημιουργία ενημέρωσης για την ${params.country}...` : "Δημιουργία παγκόσμιας ενημέρωσης...");
    }

    const startTime = performance.now();
    try {
      const { briefing: fetchedBriefing } = await getDailyBriefing(params.date, params.country, params.location, params.category, controller.signal);
      
      if (controller.signal.aborted) {
          console.log("News generation aborted.");
          return;
      }

      if (!fetchedBriefing.content.stories || fetchedBriefing.content.stories.length === 0) {
        setError("Δεν βρέθηκαν ειδήσεις για τη σημερινή επιλογή. Παρακαλώ δοκιμάστε ξανά αργότερα.");
        setStatus('error');
      } else {
        setBriefing(fetchedBriefing);
        setStatus('success');
        
        if (document.visibilityState === 'hidden' && 'Notification' in window && Notification.permission === 'granted') {
            navigator.serviceWorker.ready.then(registration => {
                const options = {
                    body: 'Η σύνοψη ειδήσεών σας είναι έτοιμη. Κάντε κλικ για να τη δείτε.',
                    icon: '/favicon.svg',
                    tag: 'news-ready'
                };
                registration.showNotification('Η ενημέρωσή σας είναι εδώ!', options);
            });
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
          console.log("News generation was aborted by the user.");
          return; // Don't set an error state
      }
      setError(err instanceof Error ? err.message : "Προέκυψε ένα άγνωστο σφάλμα.");
      setStatus('error');
    } finally {
        const endTime = performance.now();
        setLoadTime(Math.round(endTime - startTime));
        if (abortControllerRef.current === controller) {
            abortControllerRef.current = null;
        }
    }
  }, []);

  useEffect(() => {
    // Get user's location once on initial load.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        () => {
          console.warn("Location access denied. Proceeding without it.");
          setLocation(null);
        },
        { timeout: 5000 }
      );
    }
    
    // Cleanup function to abort fetch on component unmount
    return () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    };
  }, [loadNews]);
  
  useEffect(() => {
    const setupServiceWorker = () => {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const serviceWorkerUrl = new URL('/service-worker.js', window.location.origin).href;
        navigator.serviceWorker.register(serviceWorkerUrl)
          .then(swReg => console.log('Service Worker is registered', swReg))
          .catch(error => console.error('Service Worker Error', error));
      }
    };
    
    setupServiceWorker();
  }, []);

  const handleStartBriefing = (category: string | null) => {
    loadNews({ country, category, date: new Date(), location });
  };
  
  const handleGoHome = () => {
    if (status === 'loading' && abortControllerRef.current) {
        abortControllerRef.current.abort();
    }
    
    setStatus('initial');
    setBriefing(null);
  };

  const handleCountryChange = (newCountry: string | null) => {
    setCountry(newCountry);
    // If a briefing is already loaded, reload it for the new country
    if (status === 'success' || status === 'error' || status === 'loading') {
      loadNews({ country: newCountry, category: null, date: new Date(), location });
    }
  };

  const renderContent = () => {
    if (status === 'initial') {
        return <InitialScreen onStartBriefing={handleStartBriefing} />;
    }
    
    if (status === 'loading') {
        return <GenerationScreen message={loadingMessage} />;
    }
    
    if (status === 'error') {
        return (
            <div className="text-center py-20 px-4 max-w-2xl mx-auto">
                <h2 className="text-2xl font-serif mb-4 text-red-700">Κάτι πήγε στραβά</h2>
                <p className="text-stone-600 mb-8">{error || 'Προέκυψε ένα μη αναμενόμενο σφάλμα.'}</p>
                <button
                    onClick={handleGoHome}
                    className="px-8 py-3 bg-stone-900 text-stone-50 font-bold tracking-wider uppercase hover:bg-stone-700 transition-colors"
                >
                    Επιστροφή στην Αρχική
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
    <div className="min-h-screen flex flex-col bg-white">
      <Header 
        country={country}
        onCountryChange={handleCountryChange}
        showHomeButton={status !== 'initial'}
        onGoHome={handleGoHome}
      />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 flex-grow w-full">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
};

export default App;