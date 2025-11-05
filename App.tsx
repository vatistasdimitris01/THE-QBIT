
import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import NewsBriefing from './components/NewsBriefing';
import GenerationScreen from './components/LoadingSpinner';
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

  const loadNews = useCallback(async (newCountry: string | null) => {
    setStatus('loading');
    setBriefing(null);
    setError(null);
    setLoadTime(null);
    setLoadingMessage(newCountry ? `Δημιουργία ενημέρωσης για την ${newCountry}...` : "Δημιουργία παγκόσμιας ενημέρωσης...");

    const startTime = performance.now();
    try {
      const { briefing: fetchedBriefing } = await getDailyBriefing(new Date(), newCountry);
      
      if (!fetchedBriefing.content.body) {
        setError("Δεν βρέθηκαν ειδήσεις για σήμερα. Παρακαλώ δοκιμάστε ξανά αργότερα.");
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
    const registerServiceWorker = () => {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
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
    
    loadNews(country);

    return () => {
        window.removeEventListener('load', registerServiceWorker);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCountryChange = (newCountry: string | null) => {
    setCountry(newCountry);
    loadNews(newCountry);
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
      />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 flex-grow w-full">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
};

export default App;