'use client';

import { m, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/context/AuthContext';
import { X } from 'lucide-react';

interface MembershipDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    price?: string;
}

export function MembershipDrawer({
    isOpen,
    onClose,
    title,
    price,
}: MembershipDrawerProps) {
    const { user, profile } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Pre-fill form if user is logged in
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                email: user.email || '',
                name: profile?.displayName || prev.name
            }));
        }
    }, [user, profile]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Call API route which handles Firebase + Email
            const response = await fetch('/api/membership/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    message: formData.message,
                    membershipType: title,
                    price: price || '',
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create membership');
            }

            const result = await response.json();
            console.log('Membership created:', result);

            setSubmitted(true);

            // Reset form after 2 seconds
            setTimeout(() => {
                setFormData({ name: '', email: '', message: '' });
                setSubmitted(false);
                onClose();
            }, 2000);
        } catch (error) {
            console.error('Error submitting form:', error);
            setIsSubmitting(false);
            alert('Es gab einen Fehler beim Senden. Bitte versuche es später erneut.');
        }
    };

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
                    />

                    {/* Drawer/Modal */}
                    <div className="fixed inset-0 z-[101] flex items-start justify-center p-4 overflow-y-auto pt-12 md:pt-24">
                        <m.div
                            initial={{ y: '-100%', opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: '-100%', opacity: 0 }}
                            transition={{
                                type: 'spring',
                                damping: 25,
                                stiffness: 200,
                            }}
                            className="relative w-full max-w-sm bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(255,49,0,1)] p-6 mb-12"
                        >
                            {/* Header */}
                            <div className="mb-6">
                                <h3 className="text-2xl font-black uppercase text-black leading-none tracking-tighter mb-1">
                                    {title.replace(/ß/g, 'ẞ')}
                                </h3>
                                {price && (
                                    <p className="text-sm font-bold uppercase text-[#FF3100]">
                                        {price}
                                    </p>
                                )}
                                <button
                                    onClick={onClose}
                                    className="absolute top-3 right-3 bg-black text-white p-1.5 border-2 border-white hover:bg-[#FF3100] transition-colors z-10"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Form */}
                            <AnimatePresence mode="wait">
                                {submitted ? (
                                    <m.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="text-center py-8"
                                    >
                                        <m.div
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{
                                                duration: 0.6,
                                                repeat: 1,
                                            }}
                                            className="text-4xl mb-4"
                                        >
                                            ✓
                                        </m.div>
                                        <h4 className="text-xl font-black uppercase mb-1 text-black">
                                            Danke!
                                        </h4>
                                        <p className="text-sm font-bold text-black uppercase">
                                            Wir melden uns bei dir.
                                        </p>
                                    </m.div>
                                ) : (
                                    <m.form
                                        key="form"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        onSubmit={handleSubmit}
                                        className="space-y-4"
                                    >
                                        {/* Name Field */}
                                        <div>
                                            <label className="block text-[10px] font-black uppercase mb-1 text-black">
                                                Name
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-3 py-2 border-2 border-black bg-white font-bold text-sm text-black focus:outline-none focus:bg-white placeholder:text-black"
                                                placeholder="Dein Name"
                                            />
                                        </div>

                                        {/* Email Field */}
                                        <div>
                                            <label className="block text-[10px] font-black uppercase mb-1 text-black">
                                                E-Mail
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-3 py-2 border-2 border-black bg-white font-bold text-sm text-black focus:outline-none focus:bg-white placeholder:text-black"
                                                placeholder="deine@email.com"
                                            />
                                        </div>

                                        {/* Message Field */}
                                        <div>
                                            <label className="block text-[10px] font-black uppercase mb-1 text-black">
                                                Nachricht
                                            </label>
                                            <textarea
                                                name="message"
                                                value={formData.message}
                                                onChange={handleChange}
                                                rows={3}
                                                className="w-full px-3 py-2 border-2 border-black bg-white font-bold text-sm text-black focus:outline-none focus:bg-white resize-none placeholder:text-black"
                                                placeholder="Deine Nachricht..."
                                            />
                                        </div>

                                        {/* Submit Button */}
                                        <m.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            disabled={isSubmitting}
                                            type="submit"
                                            className={`w-full py-4 border-2 border-black font-black uppercase text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${
                                                isSubmitting
                                                    ? 'bg-white opacity-50 text-black cursor-not-allowed'
                                                    : 'bg-[#FF3100] text-white active:shadow-none active:translate-x-1 active:translate-y-1'
                                            }`}
                                        >
                                            {isSubmitting
                                                ? 'Wird gesendet...'
                                                : 'Jetzt beitreten'}
                                        </m.button>
                                    </m.form>
                                )}
                            </AnimatePresence>
                        </m.div>
                    </div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}