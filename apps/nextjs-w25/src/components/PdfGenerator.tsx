'use client';

import { useState } from 'react';
import jsPDF from 'jspdf';
import { Download } from 'lucide-react';

const buildImageSource = (rawUrl: string) => {
  if (!rawUrl) return '';
  if (rawUrl.startsWith('data:')) return rawUrl;
  return `/api/image-proxy?src=${encodeURIComponent(rawUrl)}`;
};

interface PdfGeneratorProps {
  imageUrl: string;
  title: string;
  artist: string;
  year: string;
  technique?: string;
  size?: string;
  edition?: string;
  description?: string;
  contact?: string;
  disclaimer?: string;
}

export default function PdfGenerator({
  imageUrl,
  title,
  artist,
  year,
  technique,
  size,
  edition,
  description,
}: PdfGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFilename, setLastFilename] = useState<string | null>(null);

  const generatePdf = async () => {
    setIsGenerating(true);
    setError(null);
    setLastFilename(null);

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      const loadableSource = buildImageSource(imageUrl);
      if (!loadableSource) {
        throw new Error('Missing artwork image');
      }
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = loadableSource;
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;

      const imgAspectRatio = img.width / img.height;
      let imgWidth = contentWidth;
      let imgHeight = imgWidth / imgAspectRatio;
      const maxImageHeight = pageHeight - 100;
      if (imgHeight > maxImageHeight) {
        imgHeight = maxImageHeight;
        imgWidth = imgHeight * imgAspectRatio;
      }

      pdf.addImage(img, 'JPEG', margin, margin, imgWidth, imgHeight);

      let yPos = margin + imgHeight + 10;
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(artist, margin, yPos);
      yPos += 6;

      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(10);
      pdf.text(`${title}, ${year}`, margin, yPos);
      yPos += 5;

      pdf.setFont('helvetica', 'normal');
      if (size) {
        pdf.text(size, margin, yPos);
        yPos += 4;
      }
      if (technique) {
        pdf.text(technique, margin, yPos);
        yPos += 4;
      }
      if (edition) {
        pdf.text(edition, margin, yPos);
        yPos += 4;
      }
      if (description) {
        const descLines = pdf.splitTextToSize(description, contentWidth);
        pdf.text(descLines, margin, yPos);
        yPos += descLines.length * 4;
      }

      const footerY = pageHeight - 15;
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text('© 2025 Bildstein I Glatz. All rights reserved. office@bildsteinglatz.com', margin, footerY);

      const filename = `${artist.replace(/\s+/g, '_')}_${title.replace(/\s+/g, '_')}_${year}.pdf`;
      pdf.save(filename);

      setLastFilename(filename);
      setIsGenerating(false);
    } catch (err) {
      console.error('PDF generation failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate PDF');
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={generatePdf}
      disabled={isGenerating}
      className="font-owners text-[10px] uppercase font-normal tracking-widest hover:text-[#ff6600] transition-colors disabled:opacity-50 leading-none"
    >
      {isGenerating ? 'Generating...' : 'download pdf'}
    </button>
  );
}
