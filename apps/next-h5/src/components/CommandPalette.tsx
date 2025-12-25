'use client';

import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import { 
  Home, 
  Paintbrush, 
  Hammer, 
  Users, 
  Gamepad2, 
  MapPin, 
  MessageSquare,
  Search,
  ArrowRight,
  Calendar,
  Palette,
  Info,
  FileText,
  Dribbble,
  X,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Toggle the menu when ⌘K is pressed, close on ESC
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      if (e.key === 'Escape' && open) {
        e.preventDefault();
        setOpen(false);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open]);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <AnimatePresence>
      {open && (
        <div 
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] p-4 bg-black/40 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-2xl bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
          >
            <Command label="Global Command Menu" className="flex flex-col h-full">
              <div className="flex items-center border-b-4 border-black p-4 gap-3">
                <Search className="w-6 h-6 text-black" />
                <Command.Input
                  autoFocus
                  placeholder="Was suchst du? (z.B. Töpfern, Map, Kunst...)"
                  className="flex-1 bg-transparent border-none outline-none text-xl font-bold placeholder:text-black/50 text-black uppercase"
                />
                <button 
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-2 py-1 bg-yellow-400 border-2 border-black font-mono text-xs font-bold text-black hover:bg-black hover:text-yellow-400 transition-colors group"
                >
                  <span>ESC</span>
                  <X className="w-4 h-4" />
                </button>
              </div>

              <Command.List className="max-h-[60vh] overflow-y-auto p-2 scrollbar-hide">
                <Command.Empty className="p-8 text-center font-bold text-xl uppercase text-black">
                  Nichts gefunden...
                </Command.Empty>

                <Command.Group heading="Navigation" className="p-2">
                  <div className="text-xs font-black uppercase text-black mb-2 px-2 tracking-widest">Navigation</div>
                  
                  <Item
                    onSelect={() => runCommand(() => router.push('/'))}
                    icon={<Home className="w-5 h-5" />}
                  >
                    Home
                  </Item>
                  
                  <Item
                    onSelect={() => runCommand(() => router.push('/artists'))}
                    icon={<Palette className="w-5 h-5" />}
                  >
                    Künstler:innen
                  </Item>

                  <Item
                    onSelect={() => runCommand(() => router.push('/atelier-aaa'))}
                    icon={<Paintbrush className="w-5 h-5" />}
                  >
                    Kunstproduktion (Atelier AAA)
                  </Item>

                  <Item
                    onSelect={() => runCommand(() => router.push('/workshops'))}
                    icon={<Hammer className="w-5 h-5" />}
                  >
                    Workshops
                  </Item>

                  <Item
                    onSelect={() => runCommand(() => router.push('/changelog'))}
                    icon={<History className="w-5 h-5" />}
                  >
                    Building Log (What's New?)
                  </Item>

                  <Item
                    onSelect={() => runCommand(() => router.push('/events'))}
                    icon={<Calendar className="w-5 h-5" />}
                  >
                    Events & Kalender
                  </Item>

                  <Item
                    onSelect={() => runCommand(() => router.push('/member'))}
                    icon={<Users className="w-5 h-5" />}
                  >
                    Mitglied werden
                  </Item>
                </Command.Group>

                <Command.Group heading="Interaktiv" className="p-2 mt-4">
                  <div className="text-xs font-black uppercase text-black mb-2 px-2 tracking-widest">Interaktiv</div>
                  
                  <Item
                    onSelect={() => {
                      setOpen(false);
                      window.dispatchEvent(new CustomEvent('open-pottery'));
                    }}
                    icon={<Gamepad2 className="w-5 h-5" />}
                  >
                    Töpfer-Spiel
                  </Item>

                  <Item
                    onSelect={() => runCommand(() => router.push('/pong'))}
                    icon={<Dribbble className="w-5 h-5" />}
                  >
                    Halle 5 Pong
                  </Item>

                  <Item
                    onSelect={() => runCommand(() => router.push('/virtual-painting'))}
                    icon={<Paintbrush className="w-5 h-5" />}
                  >
                    Virtual Painting
                  </Item>

                  <Item
                    onSelect={() => {
                      setOpen(false);
                      window.dispatchEvent(new CustomEvent('open-concierge'));
                    }}
                    icon={<MessageSquare className="w-5 h-5" />}
                  >
                    AI Concierge (Fragen?)
                  </Item>
                </Command.Group>

                <Command.Group heading="Info" className="p-2 mt-4">
                  <div className="text-xs font-black uppercase text-black mb-2 px-2 tracking-widest">Info</div>
                  
                  <Item
                    onSelect={() => runCommand(() => router.push('/#map'))}
                    icon={<MapPin className="w-5 h-5" />}
                  >
                    Standort / Map
                  </Item>

                  <Item
                    onSelect={() => runCommand(() => router.push('/about'))}
                    icon={<Info className="w-5 h-5" />}
                  >
                    Über uns
                  </Item>

                  <Item
                    onSelect={() => runCommand(() => router.push('/imprint'))}
                    icon={<FileText className="w-5 h-5" />}
                  >
                    Impressum
                  </Item>
                </Command.Group>
              </Command.List>

              <div className="border-t-4 border-black p-3 bg-gray-100 flex justify-between items-center text-xs font-bold uppercase text-black">
                <div className="flex gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 bg-white border border-black">↑↓</kbd> Navigieren
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 bg-white border border-black">↵</kbd> Auswählen
                  </span>
                </div>
                <div className="text-black">
                  Halle 5 Command Center
                </div>
              </div>
            </Command>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function Item({ children, onSelect, icon }: { children: React.ReactNode; onSelect: () => void; icon: React.ReactNode }) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex items-center gap-4 p-3 cursor-pointer aria-selected:bg-yellow-400 text-black transition-colors group border-2 border-transparent aria-selected:border-black mb-1"
    >
      <div className="p-2 bg-black text-white group-aria-selected:bg-black group-aria-selected:text-yellow-400 transition-colors">
        {icon}
      </div>
      <span className="text-lg font-bold uppercase flex-1">{children}</span>
      <ArrowRight className="w-5 h-5 opacity-0 group-aria-selected:opacity-100 transition-opacity" />
    </Command.Item>
  );
}
