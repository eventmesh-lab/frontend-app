import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import i18n from '../../i18n';

type Locale = 'es' | 'en';

interface LocaleContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

const LOCALE_STORAGE_KEY = 'app_locale';

interface LocaleProviderProps {
    children: ReactNode;
}

/**
 * LocaleProvider Component
 * Manages locale state and synchronizes with i18next
 */
export const LocaleProvider: React.FC<LocaleProviderProps> = ({ children }) => {
    // Initialize from localStorage or default to 'es'
    const [locale, setLocaleState] = useState<Locale>(() => {
        const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
        return (stored === 'es' || stored === 'en' ? stored : 'es') as Locale;
    });

    // Apply locale changes
    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale);
        localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
        i18n.changeLanguage(newLocale);
    };

    // Initialize i18n with stored locale on mount
    useEffect(() => {
        i18n.changeLanguage(locale);
    }, []);

    return (
        <LocaleContext.Provider value={{ locale, setLocale }}>
            {children}
        </LocaleContext.Provider>
    );
};

/**
 * useLocale Hook
 * Access locale context
 */
export const useLocale = (): LocaleContextType => {
    const context = useContext(LocaleContext);
    if (!context) {
        throw new Error('useLocale must be used within LocaleProvider');
    }
    return context;
};
