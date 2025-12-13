'use client'

import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// Configure PDF worker
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
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
