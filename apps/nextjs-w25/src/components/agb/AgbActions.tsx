'use client';

import { useState } from 'react';
import { FileText, Download, X } from 'lucide-react';
import jsPDF from 'jspdf';
import { motion, AnimatePresence } from 'framer-motion';
import { imprintData } from '@/data/imprint';

export default function AgbActions() {
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

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

      const [regularFont, boldFont] = await Promise.all([
        loadFont('/fonts/OwnersText-Regular.ttf'),
        loadFont('/fonts/OwnersText-Bold.ttf'),
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

      const margin = 20;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const contentWidth = pageWidth - (2 * margin);
      let yPos = margin + 10;
      const lineHeight = 5;

      const checkPageBreak = (heightNeeded: number) => {
        if (yPos + heightNeeded > pageHeight - margin) {
          pdf.addPage();
          yPos = margin;
        }
      };

      const addText = (text: string, font: 'normal' | 'bold' = 'normal', size: number = 10) => {
        pdf.setFont('OwnersText', font);
        pdf.setFontSize(size);
        const lines = pdf.splitTextToSize(text, contentWidth);
        checkPageBreak(lines.length * lineHeight);
        pdf.text(lines, margin, yPos);
        yPos += (lines.length * lineHeight) + 2;
      };

      // --- AGB ---
      addText(imprintData.agb.title, 'bold', 16);
      yPos += 5;
      addText(imprintData.agb.intro, 'normal', 10);
      yPos += 5;

      imprintData.agb.sections.forEach(section => {
        checkPageBreak(15);
        addText(section.title, 'bold', 11);
        if (section.content) {
          section.content.forEach(line => {
            addText(line, 'normal', 10);
          });
        }
        yPos += 3;
      });

      yPos += 10;

      // Footer
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont('OwnersText', 'normal');
        pdf.text(`© Bildstein | Glatz, ${new Date().getFullYear()}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
      }

      pdf.save('agb_bildstein_glatz.pdf');

    } catch (e) {
      console.error("PDF Generation failed", e);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <>
      <div className="flex gap-4 items-center">
        <button 
          onClick={() => setIsReaderOpen(true)}
          className="flex items-center gap-2 text-sm font-medium hover:text-blue-600 transition-colors"
        >
          <FileText size={16} />
          Reader View
        </button>
        <button 
          onClick={generatePdf}
          disabled={isGeneratingPdf}
          className="flex items-center gap-2 text-sm font-medium hover:text-blue-600 transition-colors disabled:opacity-50"
        >
          <Download size={16} />
          {isGeneratingPdf ? 'Generating...' : 'Download PDF'}
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
              className="bg-white text-black w-full max-w-[210mm] h-full overflow-y-auto shadow-2xl relative rounded-sm"
            >
              <button 
                onClick={() => setIsReaderOpen(false)}
                className="sticky top-4 right-4 float-right p-2 hover:bg-white rounded-full transition-colors z-10"
              >
                <X size={24} />
              </button>

              <div className="p-12 md:p-16 max-w-[65ch] mx-auto min-h-full bg-white font-owners">
                
                {/* AGB */}
                <section className="mb-12">
                  <h1 className="text-2xl font-bold mb-2">{imprintData.agb.title}</h1>
                  <p className="text-sm text-black mb-8 whitespace-pre-line">{imprintData.agb.intro}</p>
                  
                  <div className="space-y-6">
                    {imprintData.agb.sections.map((section, i) => (
                      <div key={i}>
                        <h3 className="font-bold mb-1">{section.title}</h3>
                        {section.content && section.content.map((line, j) => (
                          <p key={j} className="text-sm mb-2">{line}</p>
                        ))}
                      </div>
                    ))}
                  </div>
                </section>

                <div className="mt-16 pt-8 border-t border-black text-right text-sm text-black">
                  © Bildstein | Glatz, {new Date().getFullYear()}
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
