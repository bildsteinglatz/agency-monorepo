'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { TextPreview } from '@/types/text'

interface TextCardProps {
  text: TextPreview
}

const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const getContent = (text: TextPreview) => {
  return (text.textContent || (Array.isArray(text.body) ? text.body.join(' ') : text.body) || '').trim()
}

const firstNSentences = (content: string, n = 5) => {
  if (!content) return ''
  const sentences = content.split(/(?<=[.!?])\s+/)
  if (sentences.length <= n) return content
  return sentences.slice(0, n).join(' ').trim()
}

export function TextCard({ text }: TextCardProps) {
  const [expanded, setExpanded] = useState(false)
  if (!text.slug?.current) return null

  const content = getContent(text)
  const preview = firstNSentences(content, 5)
  const isTruncated = preview !== content

  return (
    <article className="border-b border-black dark:border-white pb-6 mb-6 last:border-b-0">
      <h2 className="text-xl font-semibold mb-2">
  <Link href={`/texts/${text.slug.current}`} className="group hover:underline">
          {text.title}
        </Link>
      </h2>

      <div className="flex flex-wrap gap-4 text-sm text-black dark:text-white mb-3">
        {text.author && <span>By {text.author}</span>}
        {text.publishedAt && <span>{formatDate(text.publishedAt)}</span>}
      </div>

      <div className="text-black dark:text-white leading-relaxed">
        <p>{expanded ? content : preview}</p>
        {isTruncated && (
          <button
            type="button"
            onClick={() => setExpanded((s) => !s)}
            className="mt-3 text-orange-500 text-sm font-medium hover:underline"
          >
            {expanded ? 'Read less' : 'Read more'}
          </button>
        )}
      </div>
    </article>
  )
}
