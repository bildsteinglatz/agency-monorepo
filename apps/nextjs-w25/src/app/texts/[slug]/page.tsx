import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { safeFetch } from '@/sanity/safeFetch'
import { TEXT_BY_SLUG_QUERY, TEXT_METADATA_QUERY } from '@/sanity/queries'
import TextActions from '@/components/texts/TextActions';
import PdfPreview from '@/components/texts/PdfPreviewWrapper.client';

export const dynamic = 'force-dynamic';

// Define types
interface TextDocument {
  _id: string;
  title: string;
  author?: string;
  textContent?: string;
  body?: string | any[];
  slug?: { current: string };
  publishedAt?: string;
  _updatedAt?: string;
  pdfUrl?: string;
}

// queries are centralized in src/sanity/queries.ts

interface TextPageProps {
  params: Promise<{ slug: string }>
}

// Generate metadata for SEO
export async function generateMetadata({ params }: TextPageProps): Promise<Metadata> {
  const p = await params
  const text = await safeFetch(TEXT_METADATA_QUERY, { slug: p.slug }, null) as unknown as TextDocument | null

  if (!text) {
    return {
      title: 'Text Not Found | Bildstein/Glatz'
    }
  }

  const description = (text.textContent as string) || (Array.isArray(text.body) ? text.body[0] : String(text.body || '')) || ''
  const truncatedDescription = description.length > 160
    ? description.substring(0, 160) + '...'
    : description

  return {
    title: `${text.title} | Bildstein/Glatz`,
    description: truncatedDescription,
    authors: text.author ? [{ name: text.author }] : undefined,
    openGraph: {
      type: 'article',
      publishedTime: text.publishedAt,
    },
  }
}

// Format date for display
const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

// Helper to resolve content from string or Portable Text
function resolveContent(text: TextDocument): string {
  if (text.textContent) return text.textContent;

  const body = text.body;
  if (!body) return '';

  if (typeof body === 'string') return body;

  if (Array.isArray(body)) {
    return body
      .map((block: any) => {
        if (block._type === 'block' && block.children) {
          return block.children.map((child: any) => child.text).join('');
        }
        return '';
      })
      .join('\n\n');
  }

  return String(body);
}

export default async function TextPage({ params }: TextPageProps) {
  const { slug } = await params;

  try {
    const textRaw = await safeFetch(TEXT_BY_SLUG_QUERY, { slug }, null)
    const text = textRaw ? (textRaw as unknown as TextDocument) : null

    // If text not found, 404
    if (!text) {
      notFound();
    }

    const content = resolveContent(text);
    const hasPdf = !!text.pdfUrl;

    return (
      <div className="min-h-screen transition-colors">
        <div className={`mx-auto px-6 pt-24 pb-20 ${hasPdf ? 'max-w-7xl' : 'max-w-[80ch]'}`}>
          <div className="mb-6">
            <Link
              href="/texts"
              className="text-blue-600 dark:text-blue-400 hover:underline flex items-center"
            >
              <span>← Back to all texts</span>
            </Link>
          </div>

          <div className={hasPdf ? 'grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12' : ''}>
            <article className={hasPdf ? 'min-w-0' : ''}>
              <header className="mb-8">
                <h1 className="text-3xl title-text mb-2">{text.title}</h1>
                <div className="text-base mb-6">
                  {text.author && text.publishedAt && (
                    <div>{text.author}, {formatDate(text.publishedAt)}</div>
                  )}
                  {text.author && !text.publishedAt && (
                    <div>{text.author}</div>
                  )}
                  {!text.author && text.publishedAt && (
                    <div>{formatDate(text.publishedAt)}</div>
                  )}
                </div>

                <TextActions
                  id={text._id}
                  title={text.title}
                  author={text.author}
                  date={text.publishedAt ? formatDate(text.publishedAt) : undefined}
                  content={content}
                  pdfUrl={text.pdfUrl}
                />
              </header>

              <div className="prose dark:prose-invert max-w-none text-lg leading-relaxed">
                {content.split('\n\n').map((paragraph: string, i: number) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </article>

            {hasPdf && (
              <aside className="mt-8 lg:mt-0">
                <div className="sticky top-24">
                  <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-black">PDF Version</h3>
                  <PdfPreview pdfUrl={text.pdfUrl!} />
                </div>
              </aside>
            )}
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Failed to fetch text:', error)
    notFound()
  }
}
