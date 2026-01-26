'use client';

import { useState } from 'react';
import jsPDF from 'jspdf';
import { Download } from 'lucide-react';

const buildImageSource = (rawUrl: string) => {
    if (!rawUrl) return '';
    if (rawUrl.startsWith('data:')) return rawUrl;
    return `/api/image-proxy?src=${encodeURIComponent(rawUrl)}`;
};

interface PortfolioItem {
    _id: string;
    title?: string;
    artist?: { name: string };
    year?: number | string;
    technique?: string;
    size?: string;
    edition?: string;
    mainImage?: any;
}

interface PortfolioPdfGeneratorProps {
    items: PortfolioItem[];
    label?: string;
    className?: string;
}

export default function PortfolioPdfGenerator({
    items,
    label = "Download Portfolio PDF",
    className = ""
}: PortfolioPdfGeneratorProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generatePdf = async () => {
        if (items.length === 0) return;
        setIsGenerating(true);
        setError(null);

        try {
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 20;
            const contentWidth = pageWidth - margin * 2;

            for (let i = 0; i < items.length; i++) {
                const item = items[i];

                // Add new page for each item except the first
                if (i > 0) {
                    pdf.addPage();
                }

                // Handle Image
                const imageUrl = item.mainImage?.asset?.url || item.mainImage?.url;
                if (imageUrl) {
                    try {
                        const img = new Image();
                        img.crossOrigin = 'anonymous';
                        const loadableSource = buildImageSource(imageUrl);

                        await new Promise((resolve, reject) => {
                            img.onload = resolve;
                            img.onerror = () => reject(new Error('Failed to load image'));
                            img.src = loadableSource;
                        });

                        const imgAspectRatio = img.width / img.height;
                        let imgWidth = contentWidth;
                        let imgHeight = imgWidth / imgAspectRatio;
                        const maxImageHeight = pageHeight - 100;

                        if (imgHeight > maxImageHeight) {
                            imgHeight = maxImageHeight;
                            imgWidth = imgHeight * imgAspectRatio;
                        }

                        pdf.addImage(img, 'JPEG', margin, margin, imgWidth, imgHeight);

                        // Positioning metadata below image
                        let yPos = margin + imgHeight + 15;

                        pdf.setFontSize(14);
                        pdf.setFont('helvetica', 'bold');
                        pdf.text(item.artist?.name || 'Bildstein | Glatz', margin, yPos);
                        yPos += 8;

                        pdf.setFont('helvetica', 'italic');
                        pdf.setFontSize(12);
                        pdf.text(`${item.title || 'Untitled'}, ${item.year || 'n.d.'}`, margin, yPos);
                        yPos += 7;

                        pdf.setFont('helvetica', 'normal');
                        pdf.setFontSize(10);
                        if (item.technique) {
                            pdf.text(item.technique, margin, yPos);
                            yPos += 5;
                        }
                        if (item.size) {
                            pdf.text(item.size, margin, yPos);
                            yPos += 5;
                        }
                        if (item.edition) {
                            pdf.text(item.edition, margin, yPos);
                            yPos += 5;
                        }

                    } catch (imgErr) {
                        console.warn(`Failed to add image for item ${item._id}`, imgErr);
                        pdf.text(`[Image Unavailable: ${item.title}]`, margin, margin + 20);
                    }
                } else {
                    pdf.text(`[No Image: ${item.title}]`, margin, margin + 20);
                }

                // Footer on each page
                const footerY = pageHeight - 15;
                pdf.setDrawColor(200, 200, 200);
                pdf.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
                pdf.setFontSize(8);
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(100, 100, 100);
                pdf.text(`© ${new Date().getFullYear()} Bildstein | Glatz. All rights reserved. office@bildsteinglatz.com`, margin, footerY);
            }

            const filename = `Portfolio_Bildstein_Glatz_${new Date().toISOString().split('T')[0]}.pdf`;
            pdf.save(filename);
            setIsGenerating(false);
        } catch (err) {
            console.error('Portfolio PDF generation failed:', err);
            setError(err instanceof Error ? err.message : 'Failed to generate PDF');
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex flex-col items-end">
            <button
                onClick={generatePdf}
                disabled={isGenerating || items.length === 0}
                className={`flex items-center gap-2 bg-foreground text-background font-bold uppercase px-6 py-3 hover:bg-neon-orange hover:text-black transition-colors disabled:opacity-50 ${className}`}
            >
                <Download size={18} />
                {isGenerating ? 'Generating Portfolio...' : label}
            </button>
            {error && <p className="text-red-500 text-[10px] mt-2 uppercase font-bold">{error}</p>}
        </div>
    );
}
