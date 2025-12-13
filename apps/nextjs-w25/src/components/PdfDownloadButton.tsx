'use client';

import { useState } from 'react';
import jsPDF from 'jspdf';

interface PdfDownloadButtonProps {
  imageUrl: string;
  title: string;
  artist: string;
  year: string;
  technique?: string;
  size?: string;
  edition?: string;
}

export default function PdfDownloadButton({
  imageUrl,
  title,
  artist,
  year,
  technique,
  size,
  edition,
}: PdfDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePdf = async () => {
    if (!imageUrl) return;
    
    setIsGenerating(true);

    try {
      // Load image first
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = imageUrl;
      });

      // Load Owners Text fonts
      const loadFont = async (url: string) => {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const base64 = btoa(
          new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        return base64;
      };

      const [regularFont, boldFont, italicFont] = await Promise.all([
        loadFont('/fonts/OwnersText-Regular.ttf'),
        loadFont('/fonts/OwnersText-Bold.ttf'),
        loadFont('/fonts/OwnersText-RegularItalic.ttf'),
      ]);

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Add custom fonts
      pdf.addFileToVFS('OwnersText-Regular.ttf', regularFont);
      pdf.addFont('OwnersText-Regular.ttf', 'OwnersText', 'normal');
      
      pdf.addFileToVFS('OwnersText-Bold.ttf', boldFont);
      pdf.addFont('OwnersText-Bold.ttf', 'OwnersText', 'bold');
      
      pdf.addFileToVFS('OwnersText-RegularItalic.ttf', italicFont);
      pdf.addFont('OwnersText-RegularItalic.ttf', 'OwnersText', 'italic');

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (2 * margin);

      // Calculate image dimensions
      const imgAspectRatio = img.width / img.height;
      let imgWidth = contentWidth;
      let imgHeight = imgWidth / imgAspectRatio;
      
      // If image is too tall, scale down
      const maxImageHeight = pageHeight - 100; // Leave space for text
      if (imgHeight > maxImageHeight) {
        imgHeight = maxImageHeight;
        imgWidth = imgHeight * imgAspectRatio;
      }

      // Add image left-aligned at margin
      pdf.addImage(imageUrl, 'JPEG', margin, margin, imgWidth, imgHeight);

      // Add text below image
      let yPos = margin + imgHeight + 10;

      // Artist name (bold) - 14pt
      pdf.setFontSize(14);
      pdf.setFont('OwnersText', 'bold');
      const artistLines = pdf.splitTextToSize(artist, contentWidth);
      pdf.text(artistLines, margin, yPos);
      yPos += artistLines.length * 6;

      // Title (italic) and year (normal) - 10pt on same line
      pdf.setFontSize(10);
      pdf.setFont('OwnersText', 'italic');
      pdf.text(title, margin, yPos);
      
      const titleWidth = pdf.getTextWidth(title);
      pdf.setFont('OwnersText', 'normal');
      pdf.text(`, ${year}`, margin + titleWidth, yPos);
      yPos += 5;

      // Size, technique, edition (normal) - 10pt
      pdf.setFont('OwnersText', 'normal');
      pdf.setFontSize(10);
      
      if (size) {
        const sizeLines = pdf.splitTextToSize(size, contentWidth);
        pdf.text(sizeLines, margin, yPos);
        yPos += sizeLines.length * 4;
      }
      
      if (technique) {
        const techniqueLines = pdf.splitTextToSize(technique, contentWidth);
        pdf.text(techniqueLines, margin, yPos);
        yPos += techniqueLines.length * 4 + 2; // Half line before edition
      }
      
      if (edition) {
        const editionLines = pdf.splitTextToSize(edition, contentWidth);
        pdf.text(editionLines, margin, yPos);
        yPos += editionLines.length * 4;
      }

      // Footer line at bottom
      const footerY = pageHeight - 15;
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
      
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      const footerLines = pdf.splitTextToSize('© 2025 Bildstein I Glatz. All rights reserved. office@bildsteinglatz.com', contentWidth);
      pdf.text(footerLines, margin, footerY);

      const filename = `${artist.replace(/\s+/g, '_')}_${title.replace(/\s+/g, '_')}_${year}.pdf`;
      pdf.save(filename);

      setIsGenerating(false);
    } catch (err) {
      console.error('PDF generation failed:', err);
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={generatePdf}
      disabled={isGenerating || !imageUrl}
      className="text-sm font-normal text-[var(--filterbar-link-color)] hover:underline disabled:opacity-50 disabled:cursor-not-allowed text-left p-0 bg-transparent border-0"
    >
      {isGenerating ? 'Generating...' : 'Download Nachweisblatt'}
    </button>
  );
}
