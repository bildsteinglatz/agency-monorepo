import React from 'react';

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="mt-auto py-6 px-8 border-t border-black dark:border-black">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-sm text-black dark:text-black text-center md:text-left">
          <p>© {currentYear} Bildstein | Glatz. All rights reserved.</p>
          <p className="mt-1">www.bildsteinglatz.com</p>
        </div>
        
        <div className="text-sm text-black dark:text-black text-center md:text-right">
          <p><a href="mailto:office@bildsteinglatz.com" className="hover:text-black dark:hover:text-white transition-colors">office@bildsteinglatz.com</a></p>
          <p><a href="tel:+4369911190126" className="hover:text-black dark:hover:text-white transition-colors">+43(0)699 11190126</a></p>
        </div>
      </div>
    </footer>
  );
}
