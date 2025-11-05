
import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import NewsBriefing from './components/NewsBriefing';
import LoadingSpinner from './components/LoadingSpinner';
import { getDailyBriefing } from './services/geminiService';
import type { Briefing } from './types';

type AppStatus = 'loading' | 'error' | 'success';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>('loading');
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [loadTime, setLoadTime] = useState<number | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [country, setCountry] = useState<string | null>('Ελλάδα');
  const [currentDate, setCurrentDate] = useState(new Date());

  const loadNews = useCallback(async (date: Date, newCountry: string | null) => {
    setStatus('loading');
    setBriefing(null);
    setError(null);
    setLoadTime(null);
    setLoadingMessage(newCountry ? `Αναζήτηση ειδήσεων στην ${newCountry}...` : "Αναζήτηση παγκόσμιων ειδήσεων...");

    const startTime = performance.now();
    try {
      const { briefing: fetchedBriefing } = await getDailyBriefing(date, newCountry);
      
      if (!fetchedBriefing.content.body) {
        setError("Δεν βρέθηκαν ειδήσεις για αυτή την ημερομηνία. Παρακαλώ επιλέξτε άλλη ημέρα.");
        setStatus('error');
      } else {
        setBriefing(fetchedBriefing);
        setStatus('success');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Προέκυψε ένα άγνωστο σφάλμα.");
      setStatus('error');
    } finally {
        const endTime = performance.now();
        setLoadTime(Math.round(endTime - startTime));
    }
  }, []);
  
  useEffect(() => {
    // Wrap Service Worker registration in a 'load' event listener
    // to prevent "The document is in an invalid state" error.
    const registerServiceWorker = () => {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        // Construct the full URL to the service worker to avoid cross-origin issues in specific environments.
        const swUrl = `${window.location.origin}/service-worker.js`;
        navigator.serviceWorker.register(swUrl)
          .then(swReg => {
            console.log('Service Worker is registered', swReg);
          })
          .catch(error => {
            console.error('Service Worker Error', error);
          });
      }
    };
    
    window.addEventListener('load', registerServiceWorker);
    
    // Initial load
    loadNews(currentDate, country);

    // Cleanup listener on component unmount
    return () => {
        window.removeEventListener('load', registerServiceWorker);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCountryChange = (newCountry: string | null) => {
    setCountry(newCountry);
    setCurrentDate(new Date()); // Reset to today when country changes
    loadNews(new Date(), newCountry);
  };

  const handleDateChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
    loadNews(newDate, country);
  };

  const renderContent = () => {
    if (status === 'loading') {
        return <LoadingSpinner message={loadingMessage} />;
    }
    
    if (status === 'error') {
        return (
            <div className="text-center py-20 px-4 max-w-2xl mx-auto">
                <h2 className="text-2xl font-serif mb-4 text-red-700">Κάτι πήγε στραβά</h2>
                <p className="text-stone-600 mb-8">{error || 'Προέκυψε ένα μη αναμενόμενο σφάλμα.'}</p>
                <button
                    onClick={() => loadNews(currentDate, country)}
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
        currentDate={currentDate}
        onDateChange={handleDateChange}
      />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 flex-grow w-full">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
};

export default App;