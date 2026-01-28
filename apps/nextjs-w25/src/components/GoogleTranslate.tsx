'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

// List of major languages
export const LANGUAGES = [
  { label: 'English', value: '/auto/en' },
  { label: 'German', value: '/auto/de' },
  { label: 'French', value: '/auto/fr' },
  { label: 'Italian', value: '/auto/it' },
  { label: 'Spanish', value: '/auto/es' },
  { label: 'Japanese', value: '/auto/ja' },
  { label: 'Chinese (Simp)', value: '/auto/zh-CN' },
  { label: 'Russian', value: '/auto/ru' },
  { label: 'Arabic', value: '/auto/ar' },
  { label: 'Portuguese', value: '/auto/pt' },
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
