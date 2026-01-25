'use client';

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF worker
if (typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

interface PdfMediaContentProps {
    url: string;
    title: string;
    onLoadSuccess: (count: number) => void;
}

export default function PdfMediaContent({ url, title, onLoadSuccess }: PdfMediaContentProps) {
    const [numPages, setNumPages] = useState<number>(0);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        onLoadSuccess(numPages);
    }

    return (
        <Document
            file={url}
            onLoadSuccess={onDocumentLoadSuccess}
            className="flex gap-[20px] md:gap-[40px]"
            loading={
                <div className="h-[50vh] md:h-[60vh] w-[40vh] bg-neutral-100 animate-pulse flex items-center justify-center font-owners text-[10px] uppercase opacity-50">
                    Loading PDF...
                </div>
            }
        >
            {Array.from(new Array(numPages), (el, index) => (
                <div
                    key={`page_${index + 1}`}
                    className="flex-shrink-0 snap-start h-[50vh] md:h-[60vh] flex items-start justify-start pointer-events-none"
                >
                    <Page
                        pageNumber={index + 1}
                        height={typeof window !== 'undefined' ? (window.innerWidth < 768 ? window.innerHeight * 0.5 : window.innerHeight * 0.6) : 600}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        className="h-full w-auto shadow-sm"
                        loading={null}
                    />
                </div>
            ))}
        </Document>
    );
}
