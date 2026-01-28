'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

// List of major languages with native labels
export const LANGUAGES = [
  { label: 'German', native: 'Deutsch', value: '/auto/de' },
  { label: 'English', native: 'English', value: '/auto/en' },
  { label: 'Mandarin Chinese', native: '简体中文', value: '/auto/zh-CN' },
  { label: 'Hindi', native: 'हिन्दी', value: '/auto/hi' },
  { label: 'Spanish', native: 'Español', value: '/auto/es' },
  { label: 'French', native: 'Français', value: '/auto/fr' },
  { label: 'Arabic', native: 'العربية', value: '/auto/ar' },
  { label: 'Bengali', native: 'বাংলা', value: '/auto/bn' },
  { label: 'Portuguese', native: 'Português', value: '/auto/pt' },
  { label: 'Indonesian', native: 'Bahasa Indonesia', value: '/auto/id' },
  { label: 'Russian', native: 'Русский', value: '/auto/ru' },
  { label: 'Urdu', native: 'اردو', value: '/auto/ur' },
  { label: 'Japanese', native: '日本語', value: '/auto/ja' },
  { label: 'Marathi', native: 'मराठी', value: '/auto/mr' },
  { label: 'Telugu', native: 'తెలుగు', value: '/auto/te' },
  { label: 'Turkish', native: 'Türkçe', value: '/auto/tr' },
  { label: 'Tamil', native: 'தமிழ்', value: '/auto/ta' },
  { label: 'Cantonese', native: '繁體中文', value: '/auto/zh-TW' },
  { label: 'Vietnamese', native: 'Tiếng Việt', value: '/auto/vi' },
  { label: 'Tagalog', native: 'Tagalog', value: '/auto/tl' },
  { label: 'Korean', native: '한국어', value: '/auto/ko' },
  { label: 'Persian', native: 'فارسی', value: '/auto/fa' },
  { label: 'Hausa', native: 'Hausa', value: '/auto/ha' },
  { label: 'Swahili', native: 'Kiswahili', value: '/auto/sw' },
  { label: 'Javanese', native: 'Basa Jawa', value: '/auto/jw' },
  { label: 'Italian', native: 'Italiano', value: '/auto/it' },
  { label: 'Punjabi', native: 'ਪੰਜਾਬੀ', value: '/auto/pa' },
  { label: 'Gujarati', native: 'ગુજરાતી', value: '/auto/gu' },
  { label: 'Thai', native: 'ไทย', value: '/auto/th' },
  { label: 'Amharic', native: 'አማርኛ', value: '/auto/am' },
  { label: 'Kannada', native: 'ಕನ್ನಡ', value: '/auto/kn' },
  { label: 'Bhojpuri', native: 'भोजपुरी', value: '/auto/bho' },
  { label: 'Burmese', native: 'မြန်မာ', value: '/auto/my' },
  { label: 'Polish', native: 'Polski', value: '/auto/pl' },
  { label: 'Pashto', native: 'پښتو', value: '/auto/ps' },
  { label: 'Malayalam', native: 'മലയാളം', value: '/auto/ml' },
  { label: 'Sundanese', native: 'Basa Sunda', value: '/auto/su' },
  { label: 'Uzbek', native: 'Oʻzbekcha', value: '/auto/uz' },
  { label: 'Sindhi', native: 'سنڌي', value: '/auto/sd' },
  { label: 'Yoruba', native: 'Yorùbá', value: '/auto/yo' },
  { label: 'Oromo', native: 'Oromo', value: '/auto/om' },
  { label: 'Maithili', native: 'मैथिली', value: '/auto/mai' },
  { label: 'Fula', native: 'Fulfulde', value: '/auto/ff' },
  { label: 'Romanian', native: 'Română', value: '/auto/ro' },
  { label: 'Azerbaijani', native: 'Azərbaycanca', value: '/auto/az' },
  { label: 'Ukrainian', native: 'Українська', value: '/auto/uk' },
  { label: 'Dutch', native: 'Nederlands', value: '/auto/nl' },
  { label: 'Igbo', native: 'Asụsụ Igbo', value: '/auto/ig' },
  { label: 'Nepali', native: 'नेपाली', value: '/auto/ne' },
  { label: 'Cebuano', native: 'Cebuano', value: '/auto/ceb' },
  { label: 'Assamese', native: 'অসমীয়া', value: '/auto/as' },
  { label: 'Hungarian', native: 'Magyar', value: '/auto/hu' },
  { label: 'Sinhala', native: 'සිංහල', value: '/auto/si' },
  { label: 'Czech', native: 'Čeština', value: '/auto/cs' },
  { label: 'Greek', native: 'Ελληνικά', value: '/auto/el' },
  { label: 'Belarusian', native: 'Беларуская', value: '/auto/be' },
  { label: 'Somali', native: 'Soomaali', value: '/auto/so' },
  { label: 'Malagasy', native: 'Malagasy', value: '/auto/mg' },
  { label: 'Kinyarwanda', native: 'Ikinyarwanda', value: '/auto/rw' },
  { label: 'Zulu', native: 'isiZulu', value: '/auto/zu' },
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
  const [currentLang, setCurrentLang] = useState('German');

  useEffect(() => {
    // Check cookie to set initial state label
    const match = document.cookie.match(/googtrans=\/auto\/([a-zA-Z-]+)/);
    if (match) {
        const found = LANGUAGES.find(l => l.value === `/auto/${match[1]}`);
        if (found) setCurrentLang(found.label);
    } else {
        // If no translation cookie, we are in the default state (German)
        setCurrentLang('German');
    }
  }, []);

  const changeLanguage = (langValue: string, label: string) => {
    const domain = window.location.hostname;
    const domainParts = domain.split('.');
    const baseDomain = domainParts.length > 2 ? domainParts.slice(-2).join('.') : domain;
    
    // 1. Clear existing cookies forcefully across multiple domain possibilities
    const clearCookie = (name: string) => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${domain}`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain}`;
      if (baseDomain !== domain) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${baseDomain}`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${baseDomain}`;
      }
    };

    clearCookie('googtrans');
    
    // If selecting German (default), we just stop here after clearing
    if (label === 'German') {
      setCurrentLang('German');
      window.location.reload();
      return;
    }

    // 2. Set new cookie
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
