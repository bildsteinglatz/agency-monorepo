'use client';

import { useState, useRef, useEffect } from 'react';
import { Share2, Link as LinkIcon, Send, Twitter, Check } from 'lucide-react'; // Using Lucide for minimalist icons
import { motion, AnimatePresence } from 'framer-motion';

interface ShareTriggerProps {
    title: string;
    description?: string;
    slug: string;
    imageUrl?: string;
    className?: string;
    baseUrl?: string;
}

export default function ShareTrigger({ title, description, slug, imageUrl, className, baseUrl = '/artworks-ii' }: ShareTriggerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}${baseUrl}?work=${slug}`;
    const shareText = `${title} by Bildstein | Glatz`;

    // Handle click outside to close dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleShare = async () => {
        // Check if mobile/touch and supports Web Share API
        if (navigator.share) {
            try {
                await navigator.share({
                    title: shareText,
                    text: description?.substring(0, 100) || shareText,
                    url: shareUrl,
                });

                // Haptic feedback (10ms vibration)
                if (navigator.vibrate) {
                    navigator.vibrate(10);
                }
            } catch (err) {
                console.log('Share failed:', err);
            }
        } else {
            // Desktop fallback: toggle custom dropdown
            setIsOpen(!isOpen);
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
                setIsOpen(false);
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const shareOnX = () => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
        setIsOpen(false);
    };

    const shareOnPinterest = () => {
        const url = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&media=${encodeURIComponent(imageUrl || '')}&description=${encodeURIComponent(shareText)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
        setIsOpen(false);
    };

    return (
        <div className="relative inline-block" ref={dropdownRef}>
            <button
                onClick={handleShare}
                className={`font-owners text-[10px] uppercase font-normal tracking-widest opacity-60 hover:opacity-100 transition-opacity flex items-center gap-1.5 ${className}`}
                aria-label="Share artwork"
            >
                <Share2 className="w-3 h-3" />
                <span className="hidden sm:inline">Share</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-full left-0 mb-3 z-[100] bg-background border border-foreground/10 shadow-xl p-1 min-w-[160px]"
                    >
                        <div className="flex flex-col">
                            <button
                                onClick={copyToClipboard}
                                className="flex items-center gap-3 px-3 py-2.5 text-[10px] uppercase tracking-widest hover:bg-foreground/5 transition-colors text-left"
                            >
                                {copied ? <Check className="w-3 h-3 text-[#ff6600]" /> : <LinkIcon className="w-3 h-3" />}
                                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                            </button>

                            <button
                                onClick={shareOnX}
                                className="flex items-center gap-3 px-3 py-2.5 text-[10px] uppercase tracking-widest hover:bg-foreground/5 transition-colors text-left"
                            >
                                <Twitter className="w-3 h-3" />
                                <span>Share on X</span>
                            </button>

                            <button
                                onClick={shareOnPinterest}
                                className="flex items-center gap-3 px-3 py-2.5 text-[10px] uppercase tracking-widest hover:bg-foreground/5 transition-colors text-left"
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.965 1.406-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.261 7.929-7.261 4.162 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
                                </svg>
                                <span>Pinterest</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
