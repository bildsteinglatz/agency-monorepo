'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

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
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

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
            // Call API route which handles Firebase + sevDesk
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

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black z-40"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{
                            type: 'spring',
                            stiffness: 300,
                            damping: 30,
                        }}
                        className="fixed right-0 top-0 h-full w-full max-w-lg bg-white border-l-8 border-black shadow-[-8px_0px_0px_0px_rgba(0,0,0,1)] z-50 overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-white border-b-4 border-black p-8 flex items-center justify-between">
                            <div>
                                <h3 className="text-3xl md:text-4xl font-black uppercase text-black">
                                    {title}
                                </h3>
                                {price && (
                                    <p className="text-xl md:text-2xl font-black mt-2 text-black">
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
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="text-center py-12"
                                    >
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{
                                                duration: 0.6,
                                                repeat: 1,
                                            }}
                                            className="text-6xl mb-6"
                                        >
                                            ✓
                                        </motion.div>
                                        <h4 className="text-2xl font-black uppercase mb-2 text-black">
                                            Danke!
                                        </h4>
                                        <p className="text-lg text-black">
                                            Wir werden dich in Kürze kontaktieren.
                                        </p>
                                    </motion.div>
                                ) : (
                                    <motion.form
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
                                                Nachricht
                                            </label>
                                            <textarea
                                                name="message"
                                                value={formData.message}
                                                onChange={handleChange}
                                                rows={5}
                                                className="w-full px-6 py-4 border-4 border-black bg-white font-bold text-lg text-black focus:outline-none focus:shadow-[0px_0px_0px_4px_rgba(0,0,0,1)] resize-none placeholder:text-black/50"
                                                placeholder="Deine Nachricht..."
                                            />
                                        </div>

                                        {/* Submit Button */}
                                        <motion.button
                                            type="submit"
                                            disabled={isSubmitting}
                                            whileHover={{
                                                scale: isSubmitting ? 1 : 1.05,
                                            }}
                                            whileTap={{
                                                scale: isSubmitting ? 1 : 0.98,
                                            }}
                                            className="w-full bg-black hover:bg-[#FF3100] text-white border-4 border-black py-6 text-xl font-black uppercase transition-all disabled:cursor-not-allowed shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                                        >
                                            {isSubmitting
                                                ? 'Wird gesendet...'
                                                : 'Jetzt beitreten'}
                                        </motion.button>
                                    </motion.form>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
