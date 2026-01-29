'use client'

import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// This fixes "TypeError: URL.parse is not a function" in some environments
if (typeof URL.parse === 'undefined') {
  URL.parse = (url: string | URL, base?: string | URL) => {
    try {
      return new URL(url, base);
    } catch {
      return null;
    }
  };
}

// Configure PDF worker
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

interface PdfViewerProps {
  file: string
  pageNumber: number
  onLoadSuccess: (data: { numPages: number }) => void
}

export default function PdfViewer({ file, pageNumber, onLoadSuccess }: PdfViewerProps) {
  return (
    <Document
      file={file}
      onLoadSuccess={onLoadSuccess}
      onLoadError={(error) => console.error('Error while loading document!', error)}
      onSourceError={(error) => console.error('Error while loading source!', error)}
      className="flex justify-center items-start"
    >
      <Page 
        pageNumber={pageNumber} 
        height={600}
        renderTextLayer={false}
        renderAnnotationLayer={false}
      />
    </Document>
  )
}
