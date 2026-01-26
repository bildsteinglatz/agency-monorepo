"use client";
import React, { useMemo, useState } from "react";
import Link from "next/link";

function portableTextToPlain(txt: any): string {
  // Handle a few common shapes: string, pre-computed textContent, or Portable Text blocks
  if (!txt) return "";
  if (typeof txt === "string") return txt;
  if (Array.isArray(txt)) {
    // Portable Text: array of blocks
    return txt
      .map((block) => {
        if (!block) return "";
        if (block._type === "block" && Array.isArray(block.children)) {
          return block.children.map((c: any) => c.text || "").join("");
        }
        // fallback for other block shapes that might contain text
        return (block.text as string) || "";
      })
      .filter(Boolean)
      .join("\n\n");
  }
  // object with textContent or body
  if (typeof txt === "object") {
    if (typeof txt.textContent === "string") return txt.textContent;
    if (Array.isArray(txt.body)) return portableTextToPlain(txt.body);
    return String(txt);
  }
  return String(txt);
}

import TextActions from '@/components/texts/TextActions';

export default function TextPreview({
  text,
  linkPrefix = "/texts/",
  sentenceCount = 5,
}: {
  text: any;
  linkPrefix?: string;
  sentenceCount?: number;
}) {
  // build a plain-text representation from common shapes
  const full = useMemo(() => {
    // prefer explicit textContent, then body, then fallback
    return (
      (text && (text.textContent || text.excerpt)) ||
      (text && text.body) ||
      ""
    );
  }, [text]);

  const fullPlain = useMemo(() => portableTextToPlain(full), [full]);

  // Split into sentences (simple heuristic)
  const sentences = useMemo(() => fullPlain.split(/(?<=[.!?])\s+/), [fullPlain]);
  const previewSentences = sentences.slice(0, sentenceCount);
  const preview = previewSentences.join(" ").trim();

  const [expanded, setExpanded] = useState(false);

  const showToggle = sentences.length > sentenceCount && preview.length > 0;

  return (
    <div className="border-t pt-6 first:border-t-0 first:pt-0 max-w-[80ch] mx-auto">
      <div className="flex justify-between items-start gap-4 mb-1">
        <h3 className="text-2xl font-medium title-text">
          {text?.slug?.current ? (
            <Link href={linkPrefix + text.slug.current} className="hover:underline">
              {text.title}
            </Link>
          ) : (
            text?.title
          )}
        </h3>

        <div className="shrink-0">
          <TextActions
            id={text._id}
            title={text.title}
            author={text.author}
            date={text.publishedAt ? new Date(text.publishedAt).toLocaleDateString() : undefined}
            content={fullPlain}
            className="flex gap-3"
          />
        </div>
      </div>

      <div className="text-sm text-black dark:text-black mb-4">
        {text?.author}
        {text?.publishedAt && (
          <>&nbsp;&bull;&nbsp;{new Date(text.publishedAt).toLocaleDateString()}</>
        )}
      </div>

      <div className={`about-text mb-2 text-lg leading-relaxed ${expanded ? 'whitespace-pre-wrap' : ''}`}>
        {!expanded ? (
          <>
            {preview || ""}
            {showToggle && "..."}
          </>
        ) : (
          fullPlain
        )}

        {showToggle && (
          <button
            className="text-blue-600 ml-2 underline hover:no-underline text-base"
            onClick={() => setExpanded((s) => !s)}
            aria-expanded={expanded}
            aria-controls={text?._id ? `text-body-${text._id}` : undefined}
          >
            {expanded ? "Read less" : "Read more"}
          </button>
        )}
      </div>
    </div>
  );
}
