'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, X, Heart } from 'lucide-react';
import jsPDF from 'jspdf';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useRetraction } from '../RetractionContext';
import { useCollection } from '@/context/CollectionContext';
import { useRouter } from 'next/navigation';

const PdfPreview = dynamic(() => import('./PdfPreview.client'), { ssr: false });

interface TextActionsProps {
  id: string;
  title: string;
  author?: string;
  date?: string;
  content: string;
  className?: string;
  pdfUrl?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function TextActions({ id, title, author, date, content, className, pdfUrl, isOpen, onOpenChange }: TextActionsProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const { setTempHidden } = useRetraction();
  const { isCollected, addToCollection, removeFromCollection, userId } = useCollection();
  const router = useRouter();

  const isFavorite = isCollected(id);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId) {
      router.push('/user-settings');
      return;
    }
    if (isFavorite) {
      await removeFromCollection(id);
    } else {
      await addToCollection(id);
    }
  };

  const isReaderOpen = isOpen !== undefined ? isOpen : internalIsOpen;

  // Effect to sync retraction state
  useEffect(() => {
    if (isReaderOpen) {
      setTempHidden(true);
      document.body.style.overflow = 'hidden';
    } else {
      setTempHidden(false);
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      setTempHidden(false);
    };
  }, [isReaderOpen, setTempHidden]);
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
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center p-0 md:p-8 pt-[120px] md:pt-[160px]"
            onClick={() => setIsReaderOpen(false)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`bg-white text-black w-full h-full overflow-y-auto shadow-2xl relative rounded-sm group ${pdfUrl ? 'max-w-[1400px]' : 'max-w-[210mm]'}`}
            >
              {/* Tab-style close button positioned OUTSIDE the content flow on mobile */}
              <div className="absolute -top-[40px] right-0 z-[60] md:static md:float-right md:top-auto md:right-auto">
                 {/* Mobile Tab: Attached to top-right, protruding upwards */}
                 <button
                    onClick={() => setIsReaderOpen(false)}
                    className="flex md:hidden items-center justify-center bg-white text-black h-[40px] px-4 rounded-t-lg shadow-[0_-2px_10px_rgba(0,0,0,0.1)] border-b border-white"
                 >
                    <X size={24} />
                 </button>

                 {/* Desktop: Original floating X inside content */}
                 <button
                    onClick={() => setIsReaderOpen(false)}
                    className="hidden md:block sticky top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                 >
                    <X size={24} />
                 </button>
              </div>

              <div className={`p-[15px] md:p-16 mx-auto min-h-full bg-white ${pdfUrl ? 'max-w-[1200px] grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12' : 'max-w-[80ch]'}`}>
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
                        <div className="relative group">
                          <PdfPreview pdfUrl={pdfUrl} />
                          <button
                            onClick={toggleFavorite}
                            className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:scale-110 transition-all z-10"
                            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-[#ff6600] text-[#ff6600]' : 'text-black'}`} />
                          </button>
                        </div>
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
                        <div className="w-[250px] aspect-[1/1.414] bg-white border border-black shadow-sm flex flex-col hover:shadow-md transition-shadow duration-300 cursor-pointer overflow-hidden" onClick={generatePdf}>
                          {pdfUrl ? (
                            <PdfPreview pdfUrl={pdfUrl} width={250} />
                          ) : (
                            <div className="p-6 flex flex-col gap-3 h-full">
                              <div className="w-3/4 h-4 bg-black/5 mb-2"></div>
                              <div className="w-full h-2 bg-black/5"></div>
                              <div className="w-full h-2 bg-black/5"></div>
                              <div className="w-2/3 h-2 bg-black/5"></div>
                              <div className="w-full h-2 bg-black/5 mt-4"></div>
                              <div className="w-full h-2 bg-black/5"></div>
                              <div className="w-full h-2 bg-black/5"></div>
                              <div className="w-full h-2 bg-black/5"></div>
                              <div className="w-1/2 h-2 bg-black/5"></div>
                            </div>
                          )}
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
