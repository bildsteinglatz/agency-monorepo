'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LANGUAGES, useGoogleTranslate } from './GoogleTranslate';

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { currentLang, changeLanguage } = useGoogleTranslate();

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeLang = LANGUAGES.find(l => l.label === currentLang) || LANGUAGES.find(l => l.label === 'German') || LANGUAGES[0];

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="font-owners uppercase font-normal text-sm opacity-50 hover:opacity-100 transition-opacity whitespace-nowrap notranslate"
        translate="no"
      >
        Language: [{mounted ? activeLang.native : 'Deutsch'}]
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop to close */}
            <div 
              className="fixed inset-0 z-[1000]" 
              onClick={() => setIsOpen(false)} 
            />
            
            {/* Dropdown Menu - Positioned bottom-full to go upwards from footer */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full right-0 mb-4 w-[90vw] md:w-[660px] border border-foreground p-4 z-[1001] shadow-[0_0_20px_rgba(0,0,0,0.2)] origin-bottom-right"
              style={{ 
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)'
              }}
            >
              <div className="grid grid-cols-3 gap-x-2 md:gap-x-4 gap-y-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.value}
                    onClick={() => changeLanguage(lang.value, lang.label)}
                    className={`text-left px-2 py-1.5 font-owners uppercase text-[9px] md:text-[10px] font-bold transition-colors notranslate truncate ${currentLang === lang.label ? 'bg-foreground text-background' : 'hover:bg-foreground hover:text-background'}`}
                    translate="no"
                    style={{
                      border: '0.5px solid transparent'
                    }}
                  >
                    {lang.native}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
