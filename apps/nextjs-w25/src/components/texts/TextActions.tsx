'use client';

import { useState } from 'react';
import { FileText, Download, X } from 'lucide-react';
import jsPDF from 'jspdf';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

const PdfPreview = dynamic(() => import('./PdfPreview.client'), { ssr: false });

interface TextActionsProps {
  title: string;
  author?: string;
  date?: string;
  content: string;
  className?: string;
  pdfUrl?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function TextActions({ title, author, date, content, className, pdfUrl, isOpen, onOpenChange }: TextActionsProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const isReaderOpen = isOpen !== undefined ? isOpen : internalIsOpen;
  const setIsReaderOpen = (val: boolean) => {
    if (onOpenChange) {
      onOpenChange(val);
    } else {
      setInternalIsOpen(val);
    }
  };

  const containerClass = className ?? "flex gap-4 mb-8 border-b border-black dark:border-black pb-4";

  const generatePdf = async () => {
    setIsGeneratingPdf(true);
    try {
      // Font loading logic
      const loadFont = async (url: string) => {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        return btoa(
          new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
      };

      const [regularFont, boldFont, italicFont] = await Promise.all([
        loadFont('/fonts/OwnersText-Regular.ttf'),
        loadFont('/fonts/OwnersText-Bold.ttf'),
        loadFont('/fonts/OwnersText-RegularItalic.ttf'),
      ]);

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      pdf.addFileToVFS('OwnersText-Regular.ttf', regularFont);
      pdf.addFont('OwnersText-Regular.ttf', 'OwnersText', 'normal');
      pdf.addFileToVFS('OwnersText-Bold.ttf', boldFont);
      pdf.addFont('OwnersText-Bold.ttf', 'OwnersText', 'bold');
      pdf.addFileToVFS('OwnersText-RegularItalic.ttf', italicFont);
      pdf.addFont('OwnersText-RegularItalic.ttf', 'OwnersText', 'italic');

      const margin = 20;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const contentWidth = pageWidth - (2 * margin);
      let yPos = margin + 10;

      // Title
      pdf.setFont('OwnersText', 'bold');
      pdf.setFontSize(24);
      const titleLines = pdf.splitTextToSize(title, contentWidth);
      pdf.text(titleLines, margin, yPos);
      yPos += (titleLines.length * 10) + 5;

      // Meta
      pdf.setFont('OwnersText', 'normal');
      pdf.setFontSize(10);
      let metaText = '';
      if (author) metaText += author;
      if (author && date) metaText += ' | ';
      if (date) metaText += date;
      
      if (metaText) {
        pdf.text(metaText, margin, yPos);
        yPos += 15;
      }

      // Content
      pdf.setFont('OwnersText', 'normal');
      pdf.setFontSize(11);
      // Split content into paragraphs
      const paragraphs = content.split('\n\n');
      
      const addFooter = () => {
        pdf.setFontSize(8);
        pdf.setFont('OwnersText', 'normal');
        const footerText = `© Bildstein | Glatz, ${new Date().getFullYear()}`;
        // Right aligned footer
        pdf.text(footerText, pageWidth - margin, pageHeight - 10, { align: 'right' });
      };

      paragraphs.forEach((para, index) => {
        const lines = pdf.splitTextToSize(para, contentWidth);
        
        // Check for page break
        if (yPos + (lines.length * 5) > pdf.internal.pageSize.getHeight() - margin) {
          addFooter();
          pdf.addPage();
          yPos = margin;
          // Reset font for body text
          pdf.setFont('OwnersText', 'normal');
          pdf.setFontSize(11);
        }
        
        pdf.text(lines, margin, yPos);
        yPos += (lines.length * 5) + 5; // Line height + paragraph spacing
      });
      
      // Add footer to the last page
      addFooter();

      pdf.save(`${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);

    } catch (e) {
      console.error("PDF Generation failed", e);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <>
      <div className={containerClass}>
        <button 
          onClick={() => setIsReaderOpen(true)}
          className="flex items-center gap-2 text-sm font-medium hover:text-blue-600 transition-colors"
        >
          <FileText size={16} />
          Reader View
        </button>
      </div>

      <AnimatePresence>
        {isReaderOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
            onClick={() => setIsReaderOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`bg-white text-black w-full h-full overflow-y-auto shadow-2xl relative rounded-sm ${pdfUrl ? 'max-w-[1400px]' : 'max-w-[210mm]'}`}
            >
              <button 
                onClick={() => setIsReaderOpen(false)}
                className="sticky top-4 right-4 float-right p-2 hover:bg-white rounded-full transition-colors z-10"
              >
                <X size={24} />
              </button>

              <div className={`p-12 md:p-16 mx-auto min-h-full bg-white ${pdfUrl ? 'max-w-[1200px] grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12' : 'max-w-[65ch]'}`}>
                <div className={pdfUrl ? 'min-w-0' : ''}>
                  <h1 className="text-3xl font-bold mb-4 font-owners">{title}</h1>
                  <div className="text-sm text-black mb-8 font-owners border-b pb-4 flex justify-between items-center">
                    <div>
                      {author && <span>{author}</span>}
                      {author && date && <span className="mx-2">|</span>}
                      {date && <span>{date}</span>}
                    </div>
                    {!pdfUrl && (
                      <button 
                        onClick={generatePdf}
                        disabled={isGeneratingPdf}
                        className="flex items-center gap-2 text-sm font-medium hover:text-blue-600 transition-colors disabled:opacity-50"
                      >
                        <Download size={16} />
                        {isGeneratingPdf ? 'Generating...' : 'Download Text PDF'}
                      </button>
                    )}
                  </div>
                  
                  <div className="prose prose-black max-w-none font-owners text-lg leading-relaxed">
                    {content.split('\n\n').map((p, i) => (
                      <p key={i} className="mb-6 text-justify">{p}</p>
                    ))}
                  </div>
                </div>

                {pdfUrl && (
                  <aside className="mt-8 lg:mt-0">
                    <div className="sticky top-0 flex flex-col gap-8">
                      {/* Original PDF Section */}
                      <div className="flex flex-col gap-4">
                        <PdfPreview pdfUrl={pdfUrl} />
                        <a 
                          href={`${pdfUrl}?dl=`}
                          className="flex items-center gap-2 text-sm font-medium hover:text-[#ff6600] transition-colors"
                          download
                        >
                          <Download size={16} />
                          Download Original PDF
                        </a>
                      </div>

                      {/* Text PDF Section */}
                      <div className="flex flex-col gap-4">
                        {/* Generated PDF Preview Placeholder */}
                        <div className="w-[250px] aspect-[1/1.414] bg-white border border-black shadow-sm p-6 flex flex-col gap-3 hover:shadow-md transition-shadow duration-300 cursor-pointer" onClick={generatePdf}>
                          <div className="w-3/4 h-4 bg-white mb-2"></div>
                          <div className="w-full h-2 bg-white"></div>
                          <div className="w-full h-2 bg-white"></div>
                          <div className="w-2/3 h-2 bg-white"></div>
                          <div className="w-full h-2 bg-white mt-4"></div>
                          <div className="w-full h-2 bg-white"></div>
                          <div className="w-full h-2 bg-white"></div>
                          <div className="w-full h-2 bg-white"></div>
                          <div className="w-1/2 h-2 bg-white"></div>
                        </div>
                        
                        <button 
                          onClick={generatePdf}
                          disabled={isGeneratingPdf}
                          className="flex items-center gap-2 text-sm font-medium hover:text-blue-600 transition-colors disabled:opacity-50 text-left"
                        >
                          <Download size={16} />
                          {isGeneratingPdf ? 'Generating...' : 'Download Text PDF'}
                        </button>
                      </div>
                    </div>
                  </aside>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
