import { safeFetch } from '@/sanity/safeFetch'
import { TEXTS_QUERY } from '@/sanity/queries'
import TextListItem from '@/components/texts/TextListItem.client'
import { MotionWrapper } from '@/components/MotionWrapper'

export const dynamic = 'force-dynamic';

export default async function Page() {
  const texts = (await safeFetch(TEXTS_QUERY, { start: 0, end: 50 }, [])) || []

  return (
    <div className="min-h-screen transition-colors">
      <h1 className="sr-only">Texts</h1>
      <div className="pt-24 pb-20">
        <MotionWrapper delay={0.9} yOffset={50}>
          <div className="flex flex-col">
            {texts.map((text: any, index: number) => (
              <TextListItem key={text._id} text={text} index={index} />
            ))}
          </div>
        </MotionWrapper>
      </div>
    </div>
  )
}
