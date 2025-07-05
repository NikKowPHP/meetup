import { useState, useEffect } from 'react';
import { create } from 'zustand';

type ConsentStore = {
  consentGiven: boolean | null;
  setConsent: (given: boolean) => void;
};

export const useConsentStore = create<ConsentStore>((set) => ({
  consentGiven: null,
  setConsent: (given) => {
    localStorage.setItem('cookieConsent', given ? 'accepted' : 'rejected');
    set({ consentGiven: given });
  },
}));

export const CookieBanner = () => {
  const { consentGiven, setConsent } = useConsentStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const storedConsent = localStorage.getItem('cookieConsent');
    if (storedConsent) {
      setConsent(storedConsent === 'accepted');
    } else {
      setIsVisible(true);
    }
  }, [setConsent]);

  if (!isVisible || consentGiven !== null) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 flex items-center justify-between">
      <div className="max-w-4xl mx-auto flex-grow">
        <p className="text-sm">
          We use cookies to enhance your experience. By continuing to visit this site,
          you agree to our use of cookies.{' '}
          <a href="/privacy" className="underline hover:text-blue-300">
            Learn more
          </a>
        </p>
      </div>
      <div className="flex gap-2 ml-4">
        <button
          onClick={() => {
            setConsent(true);
            setIsVisible(false);
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
        >
          Accept
        </button>
        <button
          onClick={() => {
            setConsent(false);
            setIsVisible(false);
          }}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded"
        >
          Reject
        </button>
      </div>
    </div>
  );
};