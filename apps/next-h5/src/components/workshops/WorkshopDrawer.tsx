'use client';

import { m, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface WorkshopDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    workshopTitle: string;
    workshopDate?: string;
    price?: string;
    isPrebooking?: boolean;
}

export function WorkshopDrawer({
    isOpen,
    onClose,
    workshopTitle,
    workshopDate,
    price,
    isPrebooking = false,
}: WorkshopDrawerProps) {
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
            // Call API route which handles Firebase + sevDesk + Resend
            const response = await fetch('/api/workshops/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    message: formData.message,
                    workshopTitle,
                    workshopDate: workshopDate || '',
                    price: price || '',
                    isPrebooking,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to register for workshop');
            }

            const result = await response.json();
            console.log('Workshop registration successful:', result);

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
                        className="fixed inset-0 bg-black z-[100]"
                    />

                    {/* Drawer */}
                    <m.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{
                            type: 'spring',
                            stiffness: 300,
                            damping: 30,
                        }}
                        className="fixed right-0 top-0 h-full w-full max-w-lg bg-white border-l-8 border-black z-[101] overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-white border-b-4 border-black p-8 flex items-center justify-between">
                            <div>
                                <h3 className="text-3xl md:text-4xl font-black uppercase text-black leading-tight">
                                    {workshopTitle}
                                </h3>
                                {workshopDate && (
                                    <p className="text-xl font-black mt-2 text-[#FF3100]">
                                        {workshopDate}
                                    </p>
                                )}
                                {price && (
                                    <p className="text-xl font-black mt-1 text-black">
                                        {price}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={onClose}
                                className="flex-shrink-0 bg-black hover:bg-[#FF3100] text-white px-5 py-3 border-4 border-black transition-all text-3xl font-black leading-none"
                            >
                                ×
                            </button>
                        </div>

                        {/* Form */}
                        <div className="p-8">
                            <AnimatePresence mode="wait">
                                {submitted ? (
                                    <m.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="text-center py-12"
                                    >
                                        <m.div
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{
                                                duration: 0.6,
                                                repeat: 1,
                                            }}
                                            className="text-6xl mb-6"
                                        >
                                            ✓
                                        </m.div>
                                        <h4 className="text-2xl font-black uppercase mb-2 text-black">
                                            {isPrebooking ? 'Voranmeldung erhalten!' : 'Anmeldung erhalten!'}
                                        </h4>
                                        <p className="text-lg text-black">
                                            Wir haben dir eine Bestätigung per E-Mail geschickt.
                                        </p>
                                    </m.div>
                                ) : (
                                    <m.form
                                        key="form"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        onSubmit={handleSubmit}
                                        className="space-y-6"
                                    >
                                        {/* Name Field */}
                                        <div>
                                            <label className="block text-sm font-black uppercase mb-3 text-black">
                                                Name
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-6 py-4 border-4 border-black bg-white font-bold text-lg text-black focus:outline-none focus:shadow-[0px_0px_0px_4px_rgba(0,0,0,1)] placeholder:text-black/50"
                                                placeholder="Dein Name"
                                            />
                                        </div>

                                        {/* Email Field */}
                                        <div>
                                            <label className="block text-sm font-black uppercase mb-3 text-black">
                                                E-Mail
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-6 py-4 border-4 border-black bg-white font-bold text-lg text-black focus:outline-none focus:shadow-[0px_0px_0px_4px_rgba(0,0,0,1)] placeholder:text-black/50"
                                                placeholder="deine@email.com"
                                            />
                                        </div>

                                        {/* Message Field */}
                                        <div>
                                            <label className="block text-sm font-black uppercase mb-3 text-black">
                                                Anmerkungen (Optional)
                                            </label>
                                            <textarea
                                                name="message"
                                                value={formData.message}
                                                onChange={handleChange}
                                                rows={4}
                                                className="w-full px-6 py-4 border-4 border-black bg-white font-bold text-lg text-black focus:outline-none focus:shadow-[0px_0px_0px_4px_rgba(0,0,0,1)] placeholder:text-black/50 resize-none"
                                                placeholder="Hast du Fragen oder Wünsche?"
                                            />
                                        </div>

                                        {/* Submit Button */}
                                        <m.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            disabled={isSubmitting}
                                            type="submit"
                                            className={`w-full py-6 border-4 border-black font-black uppercase text-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all ${
                                                isSubmitting
                                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                    : 'bg-[#FF3100] text-white hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]'
                                            }`}
                                        >
                                            {isSubmitting ? 'Wird gesendet...' : isPrebooking ? 'Jetzt voranmelden' : 'Jetzt verbindlich anmelden'}
                                        </m.button>

                                        <p className="text-xs font-bold uppercase text-black/60 text-center">
                                            Mit der Anmeldung akzeptierst du unsere Teilnahmebedingungen.
                                        </p>
                                    </m.form>
                                )}
                            </AnimatePresence>
                        </div>
                    </m.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}