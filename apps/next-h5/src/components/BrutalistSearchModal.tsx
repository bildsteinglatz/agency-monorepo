'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  link?: string;
  linkText?: string;
}

interface BrutalistSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_PROMPTS = [
  "Suche Künstler:in",
  "Produktions-Hilfe",
  "Workshop buchen",
  "Über Halle 5"
];

export default function BrutalistSearchModal({ isOpen, onClose }: BrutalistSearchModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, userMessage] 
        }),
      });

      if (!response.ok) {
        const responseText = await response.text().catch(() => "Could not read response body");
        
        let errorMessage = `Server error: ${response.status}`;
        try {
          const errorData = JSON.parse(responseText);
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          // Not JSON
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: data.candidates?.[0]?.content?.parts?.[0]?.text || "Entschuldigung, ich konnte das nicht verarbeiten."
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "SYSTEM ERROR: AI SERVICE UNAVAILABLE. FALLING BACK TO MANUAL SEARCH.",
        link: `https://www.google.com/search?q=site:halle5.at+${encodeURIComponent(text)}`,
        linkText: "SEARCH VIA GOOGLE"
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Chat Window */}
          <motion.div 
            initial={{ scale: 0.9, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 50, opacity: 0 }}
            className="relative w-full max-w-3xl h-[80vh] bg-white border-8 border-black shadow-[20px_20px_0px_0px_rgba(255,49,0,1)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-black text-white p-4 md:p-6 flex justify-between items-center border-b-8 border-black shrink-0">
              <div>
                <h2 className="text-2xl md:text-4xl font-black uppercase leading-none tracking-tighter">HALLE 5 CONCIERGE</h2>
                <p className="text-yellow-400 font-bold uppercase text-xs md:text-sm mt-1">Bemühe unseren Concierge für deine Fragen zu Halle 5.</p>
              </div>
              <button 
                onClick={onClose}
                className="bg-[#FF3100] text-white px-4 py-2 font-black uppercase hover:bg-white hover:text-black transition-colors border-4 border-white text-sm md:text-base"
              >
                [X]
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#f0f0f0] space-y-6 custom-scrollbar">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center space-y-8 opacity-0 animate-fadeIn" style={{ animationFillMode: 'forwards', animationDuration: '0.5s' }}>
                  <div className="text-center space-y-2">
                    <p className="font-black uppercase text-xl md:text-2xl">HALLE 5 CONCIERGE</p>
                    <p className="font-bold uppercase text-sm text-black">Bemühe unseren Concierge deine Fragen zu Halle 5 zu beantworten.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg">
                    {QUICK_PROMPTS.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(prompt)}
                        className="bg-white border-4 border-black p-4 font-bold uppercase hover:bg-black hover:text-white hover:translate-x-1 hover:translate-y-1 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`
                          max-w-[85%] p-4 border-4 border-black font-bold
                          ${msg.role === 'user' 
                            ? 'bg-yellow-400 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-sm md:text-base' 
                            : 'bg-white text-black shadow-[-4px_4px_0px_0px_rgba(0,0,0,1)] text-sm md:text-base leading-relaxed'
                          }
                        `}
                      >
                        {msg.content}
                        {msg.link && (
                          <a 
                            href={msg.link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="block mt-2 underline decoration-2 hover:bg-black hover:text-white transition-colors p-1"
                          >
                            → {msg.linkText || "LINK"}
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-black text-white p-4 border-4 border-black font-bold animate-pulse">
                        THINKING...
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 md:p-6 bg-white border-t-8 border-black shrink-0">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="FRAG MICH ETWAS..."
                  className="flex-1 border-4 border-black p-4 font-bold uppercase focus:outline-none focus:bg-yellow-50 placeholder:text-black text-black"
                  autoFocus
                />
                <button
                  onClick={() => handleSend(input)}
                  disabled={isLoading || !input.trim()}
                  className="bg-black text-white px-6 md:px-8 font-black uppercase hover:bg-[#FF3100] transition-colors border-4 border-black disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  SEND
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
