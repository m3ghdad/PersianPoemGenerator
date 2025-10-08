import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, getTranslation, Translations } from '../utils/translations';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Translations;
  isRTL: boolean;
  hasSelectedLanguage: boolean;
  isLoadingPreference: boolean;
  saveLanguagePreference: (language: Language, userId?: string) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguageState] = useState<Language | null>(null); // Start with null to detect first-time users
  const [hasSelectedLanguage, setHasSelectedLanguage] = useState(false);
  const [isLoadingPreference, setIsLoadingPreference] = useState(true);

  // Load language from localStorage on mount
  useEffect(() => {
    console.log('LanguageProvider: Checking localStorage for saved language...');
    const savedLanguage = localStorage.getItem('app-language') as Language;
    if (savedLanguage && ['fa', 'en'].includes(savedLanguage)) {
      console.log('✓ Found saved language in localStorage:', savedLanguage);
      setLanguageState(savedLanguage);
      setHasSelectedLanguage(true);
    } else {
      console.log('✗ No saved language found in localStorage');
    }
    setIsLoadingPreference(false);
  }, []);

  // Save language preference to both localStorage and server (if user is logged in)
  const saveLanguagePreference = async (newLanguage: Language, userId?: string) => {
    setLanguageState(newLanguage);
    localStorage.setItem('app-language', newLanguage);
    setHasSelectedLanguage(true);

    // If user is logged in, save to server
    if (userId) {
      try {
        await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-c192d0ee/user-preference`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            userId,
            preference: 'language',
            value: newLanguage
          })
        });
        console.log('✓ Language preference saved to server');
      } catch (error) {
        console.warn('Failed to save language preference to server:', error);
        // Continue anyway - localStorage is sufficient
      }
    }
  };

  // Save language to localStorage when changed
  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem('app-language', newLanguage);
    setHasSelectedLanguage(true);
  };

  const t = getTranslation(language || 'fa'); // Default to 'fa' if language is null
  const isRTL = (language || 'fa') === 'fa';

  return (
    <LanguageContext.Provider value={{ 
      language: language || 'fa', 
      setLanguage, 
      t, 
      isRTL,
      hasSelectedLanguage,
      isLoadingPreference,
      saveLanguagePreference
    }}>
      <div dir={isRTL ? 'rtl' : 'ltr'} className={isRTL ? 'rtl' : 'ltr'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};