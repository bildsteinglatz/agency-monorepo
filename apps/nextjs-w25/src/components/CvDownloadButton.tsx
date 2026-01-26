'use client';

import { useState } from 'react';
import { jsPDF } from 'jspdf';
import { Exhibition, formatExhibitionDetails } from '@/utils/exhibitions';
import { Download } from 'lucide-react';

interface CvDownloadButtonProps {
  soloExhibitions: Exhibition[];
  groupExhibitions: Exhibition[];
  publicSpaceExhibitions?: Exhibition[];
  fairExhibitions: Exhibition[];
  biennaleExhibitions: Exhibition[];
  otherExhibitions: Exhibition[];
}

export default function CvDownloadButton({
  soloExhibitions,
  groupExhibitions,
  publicSpaceExhibitions = [],
  fairExhibitions,
  biennaleExhibitions,
  otherExhibitions,
}: CvDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePdf = () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF();
      let y = 20;
      const lineHeight = 7;
      const margin = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const contentWidth = pageWidth - margin * 2;

      const currentDate = new Date();
      const dateString = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      // Title
      doc.setFontSize(16);
      doc.text(`CV – Bildstein | Glatz – ${dateString}`, margin, y);
      y += lineHeight * 2;

      // Biography Matthias
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Matthias Bildstein', margin, y);
      y += lineHeight;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('Geboren 1978 in Hohenems, Österreich', margin, y);
      y += lineHeight;
      doc.text('Lebt und arbeitet in Wien und Dornbirn', margin, y);
      y += lineHeight * 1.5;

      doc.text('Ausbildung:', margin, y);
      y += lineHeight;
      const matthiasEdu = [
        '2006-2011 Universität für Angewandte Kunst Wien, Bildhauerei und Multimedia (Erwin Wurm), Mag. art',
        '2006-2008 Akademie der bildenden Künste Wien, Video und Video Installation (Dorit Margreiter)',
        '1998-2002 Fachhochschule Vorarlberg, Intermedia, Mag. FH',
        '2001 Hogeschool voor de Kunsten, Utrecht (Exchange semester)'
      ];
      matthiasEdu.forEach(edu => {
        const lines = doc.splitTextToSize(edu, contentWidth);
        doc.text(lines, margin, y);
        y += lineHeight * lines.length;
      });
      y += lineHeight;

      // Biography Philippe
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Philippe Glatz', margin, y);
      y += lineHeight;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('Geboren 1979 in St. Gallen, Schweiz', margin, y);
      y += lineHeight;
      doc.text('Lebt und arbeitet in Kreuzlingen und Dornbirn', margin, y);
      y += lineHeight * 1.5;

      doc.text('Ausbildung:', margin, y);
      y += lineHeight;
      const philippeEdu = [
        '2009-2011 Akademie der Bildenden Künste Wien, Abstrakte Malerei (Erwin Bohatsch), Mag. art',
        '2009-2010 Universität für Angewandte Kunst Wien, Malerei (Johanna Kandl)',
        '2009-2010 National College of Art and Design, Dublin (Erasmus, Malerei-Klasse)',
        '2006-2009 Zürcher Hochschule der Künste, BA in Fine Art',
        '1996-2000 Ausbildung zum Offsetdrucker'
      ];
      philippeEdu.forEach(edu => {
        const lines = doc.splitTextToSize(edu, contentWidth);
        doc.text(lines, margin, y);
        y += lineHeight * lines.length;
      });
      y += lineHeight * 2;

      // Helper to add section
      const addSection = (title: string, exhibitions: Exhibition[]) => {
        if (exhibitions.length === 0) return;

        // Check for page break
        if (y > 250) {
          doc.addPage();
          y = 20;
        }

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(title, margin, y);
        y += lineHeight * 1.5;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        exhibitions.forEach(ex => {
          const year = (ex.year || '').toString();
          const details = formatExhibitionDetails(ex).replace(/\s+,/g, ',');

          // Calculate height needed for details
          // We reserve 11mm for the year column
          const yearWidth = 11;
          const detailsWidth = contentWidth - yearWidth;
          const lines = doc.splitTextToSize(details, detailsWidth);

          if (y + (lines.length * lineHeight) > 270) {
            doc.addPage();
            y = 20;
          }

          // Draw year
          doc.text(year, margin, y);

          // Draw details aligned to the right of year
          doc.text(lines, margin + yearWidth, y);

          y += lineHeight * lines.length;
        });
        y += lineHeight;
      };

      addSection('Solo Exhibitions', soloExhibitions);
      addSection('Works in public space', publicSpaceExhibitions);
      addSection('Group Exhibitions', groupExhibitions);
      addSection('Art Fairs', fairExhibitions);
      addSection('Biennials', biennaleExhibitions);
      addSection('Other', otherExhibitions);

      // Add footer to all pages
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(`© Bildstein | Glatz, ${new Date().getFullYear()}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
      }

      doc.save('cv_bildstein_glatz.pdf');
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={generatePdf}
      disabled={isGenerating}
      className="flex items-center gap-2 text-sm font-medium hover:text-blue-600 transition-colors disabled:opacity-50"
    >
      <Download size={16} />
      {isGenerating ? 'Generating...' : 'Download PDF'}
    </button>
  );
}