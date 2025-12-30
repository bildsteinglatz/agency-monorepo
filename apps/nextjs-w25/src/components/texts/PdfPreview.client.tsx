'use client';

import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure worker
if (typeof window !== 'undefined') {
  // Use unpkg to load the worker matching the installed pdfjs-dist version
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

interface PdfPreviewProps {
  pdfUrl: string;
  width?: number;
  className?: string;
  onClick?: () => void;
}

export default function PdfPreview({ pdfUrl, width = 250, className, onClick }: PdfPreviewProps) {
  const content = (
    <Document
      file={pdfUrl}
      className="flex justify-center items-start max-w-full"
      loading={
        <div style={{ width, height: width * 1.4 }} className="bg-white animate-pulse flex items-start justify-center text-black text-xs">
          Loading...
        </div>
      }
      error={
        <div style={{ width, height: width * 1.4 }} className="bg-white flex items-start justify-center text-red-400 text-xs p-2 text-center">
          Error
        </div>
      }
    >
      <Page 
        pageNumber={1} 
        width={width} 
        renderTextLayer={false}
        renderAnnotationLayer={false}
      />
    </Document>
  );

  return (
    <div className={`flex flex-col items-start gap-4 ${className || ''}`}>
      <div className="border border-black shadow-sm hover:shadow-md transition-shadow duration-300 bg-white">
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
