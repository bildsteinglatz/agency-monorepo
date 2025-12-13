'use client'

import { PortableText } from '@portabletext/react'
import { Exhibition } from '@/types/exhibition'

interface ExhibitionContentProps {
  exhibition: Exhibition
}

// Custom components for PortableText rendering
const portableTextComponents = {
  block: {
    normal: ({children}: any) => <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">{children}</p>,
    h2: ({children}: any) => <h2 className="text-2xl font-semibold title-text mb-4 mt-8">{children}</h2>,
    h3: ({children}: any) => <h3 className="text-xl font-semibold title-text mb-3 mt-6">{children}</h3>,
    h4: ({children}: any) => <h4 className="text-lg font-semibold title-text mb-2 mt-4">{children}</h4>,
    blockquote: ({children}: any) => (
      <blockquote className="border-l-4 border-orange-500 pl-4 my-6 italic text-gray-600 dark:text-gray-400">
        {children}
      </blockquote>
    ),
  },
  marks: {
    strong: ({children}: any) => <strong className="font-semibold">{children}</strong>,
    em: ({children}: any) => <em className="italic">{children}</em>,
    link: ({children, value}: any) => (
      <a 
        href={value.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 underline"
      >
        {children}
      </a>
    ),
  },
  list: {
    bullet: ({children}: any) => <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>,
    number: ({children}: any) => <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>,
  },
  listItem: {
    bullet: ({children}: any) => <li className="text-gray-700 dark:text-gray-300">{children}</li>,
    number: ({children}: any) => <li className="text-gray-700 dark:text-gray-300">{children}</li>,
  },
}

export function ExhibitionContent({ exhibition }: ExhibitionContentProps) {
  return (
    <div className="prose prose-gray dark:prose-invert max-w-none">
      {/* Exhibition Description */}
      {exhibition.text && exhibition.text.length > 0 ? (
        <div>
          <h2 className="text-2xl font-semibold title-text mb-6">About this Exhibition</h2>
          <div className="text-base">
            <PortableText 
              value={exhibition.text} 
              components={portableTextComponents}
            />
          </div>
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-semibold title-text mb-6">About this Exhibition</h2>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 text-center text-gray-500 dark:text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.007-5.824-2.448M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p>No description available for this exhibition.</p>
          </div>
        </div>
      )}
    </div>
  )
}
