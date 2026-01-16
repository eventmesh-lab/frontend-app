import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '../../contexts/LocaleContext';

/**
 * LanguageSwitcher Component
 * Allows users to switch between Spanish and English
 */
export const LanguageSwitcher: React.FC = () => {
    const { i18n } = useTranslation();
    const { locale, setLocale } = useLocale();

    const handleLanguageChange = (newLocale: 'es' | 'en') => {
        setLocale(newLocale);
    };

    return (
        <div className="language-switcher">
            <div className="btn-group btn-group-sm" role="group" aria-label="Language selector">
                <button
                    type="button"
                    className={`btn ${locale === 'es' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => handleLanguageChange('es')}
                    title="Español"
                >
                    🇪🇸 ES
                </button>
                <button
                    type="button"
                    className={`btn ${locale === 'en' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => handleLanguageChange('en')}
                    title="English"
                >
                    🇬🇧 EN
                </button>
            </div>
        </div>
    );
};
