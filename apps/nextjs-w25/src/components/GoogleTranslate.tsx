'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

// List of major languages with native labels
export const LANGUAGES = [
  { label: 'English', native: 'English', value: '/auto/en' },
  { label: 'German', native: 'Deutsch', value: '/auto/de' },
  { label: 'French', native: 'Français', value: '/auto/fr' },
  { label: 'Italian', native: 'Italiano', value: '/auto/it' },
  { label: 'Spanish', native: 'Español', value: '/auto/es' },
  { label: 'Japanese', native: '日本語', value: '/auto/ja' },
  { label: 'Chinese (Simp)', native: '简体中文', value: '/auto/zh-CN' },
  { label: 'Russian', native: 'Русский', value: '/auto/ru' },
  { label: 'Arabic', native: 'العربية', value: '/auto/ar' },
  { label: 'Portuguese', native: 'Português', value: '/auto/pt' },
];

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: any;
  }
}

export function GoogleTranslateInit() {
  return (
    <>
      <Script id="google-translate-setup" strategy="afterInteractive">
        {`
          window.googleTranslateElementInit = function() {
            if (window.google && window.google.translate) {
              new window.google.translate.TranslateElement(
                {
                  pageLanguage: 'auto',
                  autoDisplay: false,
                  layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
                },
                'google_translate_element'
              );
            }
          };
        `}
      </Script>
      <Script
        id="google-translate-script"
        strategy="afterInteractive"
        src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
      />
    </>
  );
}

export function useGoogleTranslate() {
  const [currentLang, setCurrentLang] = useState('English');

  useEffect(() => {
    // Check cookie to set initial state label
    const match = document.cookie.match(/googtrans=\/auto\/([a-zA-Z-]+)/);
    if (match) {
        const found = LANGUAGES.find(l => l.value === `/auto/${match[1]}`);
        if (found) setCurrentLang(found.label);
    }
  }, []);

  const changeLanguage = (langValue: string, label: string) => {
    const domain = window.location.hostname;
    
    // 1. Clear existing cookies forcefully
    document.cookie = `googtrans=; max-age=0; path=/;`;
    document.cookie = `googtrans=; max-age=0; path=/; domain=.${domain}`;
    
    // 2. Set new cookie
    // For localhost, we don't set the domain attribute
    if (domain !== 'localhost') {
        document.cookie = `googtrans=${langValue}; path=/; domain=.${domain}`;
    }
    document.cookie = `googtrans=${langValue}; path=/;`;

    setCurrentLang(label);
    
    // 3. Reload to apply
    window.location.reload();
  };

  return { currentLang, changeLanguage };
}
