"use client";
import React, { useMemo, useState } from "react";
import TextActions from '@/components/texts/TextActions';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';

const PdfPreview = dynamic(() => import('@/components/texts/PdfPreview.client'), { ssr: false });

function portableTextToPlain(txt: any): string {
  if (!txt) return "";
  if (typeof txt === "string") return txt;
  if (Array.isArray(txt)) {
    return txt
      .map((block) => {
        if (!block) return "";
        if (block._type === "block" && Array.isArray(block.children)) {
          return block.children.map((c: any) => c.text || "").join("");
        }
        return (block.text as string) || "";
      })
      .filter(Boolean)
      .join("\n\n");
  }
  if (typeof txt === "object") {
    if (typeof txt.textContent === "string") return txt.textContent;
    if (Array.isArray(txt.body)) return portableTextToPlain(txt.body);
    return String(txt);
  }
  return String(txt);
}

export default function TextListItem({
  text,
  index,
}: {
  text: any;
  index: number;
}) {
  const [isReaderOpen, setIsReaderOpen] = useState(false);

  const full = useMemo(() => {
    return (
      (text && (text.textContent || text.excerpt)) ||
      (text && text.body) ||
      ""
    );
  }, [text]);

  const fullPlain = useMemo(() => portableTextToPlain(full), [full]);

  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 80,
        damping: 20,
        delay: 0.9 + index * 0.05
      }}
      className={`
        relative py-4 border-t border-b border-current transition-colors
        ${index === 0 ? '' : '-mt-[1px]'}
        hover:z-10
      `}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex gap-6 items-start">
          {text.pdfUrl && (
            <div className="shrink-0 hidden sm:block">
              <PdfPreview 
                pdfUrl={text.pdfUrl} 
                width={80} 
                onClick={() => setIsReaderOpen(true)}
              />
            </div>
          )}
          <div className="flex flex-col">
            <h3 className="text-xl font-medium title-text">
               {text?.title}
            </h3>
            {text?.author && (
              <div className="text-sm text-black dark:text-black mt-1">
                by {text.author}
              </div>
            )}
          </div>
        </div>
        
        <div className="shrink-0 pt-1">
          <TextActions 
            title={text.title} 
            author={text.author} 
            date={text.publishedAt ? new Date(text.publishedAt).toLocaleDateString() : undefined}
            content={fullPlain}
            className="flex gap-3"
            pdfUrl={text.pdfUrl}
            isOpen={isReaderOpen}
            onOpenChange={setIsReaderOpen}
          />
        </div>
      </div>
    </motion.div>
  );
}
