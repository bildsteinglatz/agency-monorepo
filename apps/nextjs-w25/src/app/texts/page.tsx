import { safeFetch } from '@/sanity/safeFetch'
import { TEXTS_QUERY } from '@/sanity/queries'
import TextListItem from '@/components/texts/TextListItem.client'
import { MotionWrapper } from '@/components/MotionWrapper'

export const dynamic = 'force-dynamic';

export default async function Page() {
  const texts = (await safeFetch(TEXTS_QUERY, { start: 0, end: 50 }, [])) || []

  return (
  <div className="max-w-4xl mx-auto px-6 pt-24 pb-20">
      {/* Invisible SEO title */}
      <h1 className="sr-only">Texts</h1>
      <MotionWrapper delay={0.9} yOffset={50}>
      <div className="flex flex-col">
        {texts.map((text: any, index: number) => (
          <TextListItem key={text._id} text={text} index={index} />
        ))}
      </div>
      </MotionWrapper>
    </div>
  )
}
