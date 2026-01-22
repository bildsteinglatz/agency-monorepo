'use client';

import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure worker
if (typeof window !== 'undefined') {
  // Use unpkg to load the worker matching the installed pdfjs-dist version
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

interface PdfPreviewProps {
  pdfUrl: string;
  width?: number;
  className?: string;
  onClick?: () => void;
}

export default function PdfPreview({ pdfUrl, width = 250, className, onClick }: PdfPreviewProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const content = (
    <Document
      file={pdfUrl}
      className="flex justify-center items-start max-w-full"
      onLoadError={(error) => console.error('Error while loading document!', error)}
      onSourceError={(error) => console.error('Error while loading source!', error)}
      loading={
        <div style={{ width, height: width * 1.4 }} className="bg-gray-50 animate-pulse flex items-center justify-center" />
      }
      error={
        <div style={{ width, height: width * 1.4 }} className="bg-gray-50 flex items-center justify-center text-gray-400 text-[10px] p-2 text-center uppercase tracking-widest font-mono">
          PDF Error
        </div>
      }
    >
      <div className={`transition-opacity duration-700 ease-out ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <Page 
          pageNumber={1} 
          width={width} 
          renderTextLayer={false}
          renderAnnotationLayer={false}
          onRenderSuccess={() => setIsLoaded(true)}
        />
      </div>
    </Document>
  );

  return (
    <div className={`flex flex-col items-start gap-4 ${className || ''}`}>
      <div className="border border-black/10 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white overflow-hidden">
        {onClick ? (
          <div onClick={onClick} className="block cursor-pointer">
            {content}
          </div>
        ) : (
          <a href={`${pdfUrl}?dl=`} target="_blank" rel="noopener noreferrer" className="block">
            {content}
          </a>
        )}
      </div>
    </div>
  );
}
