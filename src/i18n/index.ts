import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import esTranslations from './locales/es.json';
import enTranslations from './locales/en.json';

/**
 * i18next Configuration
 * Supports Spanish (es) and English (en)
 */

const defaultLocale = import.meta.env.VITE_DEFAULT_LOCALE || 'es';

i18n
    .use(initReactI18next) // Passes i18n down to react-i18next
    .init({
        resources: {
            es: {
                translation: esTranslations,
            },
            en: {
                translation: enTranslations,
            },
        },
        lng: defaultLocale, // Default language
        fallbackLng: 'es', // Fallback language
        interpolation: {
            escapeValue: false, // React already escapes values
        },
        react: {
            useSuspense: false, // Disable suspense for better control
        },
    });

export default i18n;
