import { imprintData } from '@/data/imprint';
import { MotionWrapper } from '@/components/MotionWrapper';
import AgbActions from '@/components/agb/AgbActions';

export const metadata = {
  title: 'AGB | Bildstein | Glatz',
  description: 'Allgemeine Geschäftsbedingungen (AGB) von Bildstein | Glatz.',
};

export default function AgbPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-6 pt-24 pb-20">
        <h1 className="sr-only">AGB</h1>
        <MotionWrapper delay={0.2} yOffset={20}>
          <section id="agb" className="scroll-mt-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <h2 className="title-text text-xl mb-0">{imprintData.agb.title}</h2>
              <AgbActions />
            </div>
            <div className="body-text mb-8 whitespace-pre-line">
              {imprintData.agb.intro}
            </div>

            <div className="space-y-8">
              {imprintData.agb.sections.map((section, i) => (
                <div key={i} className="mb-8">
                  <h3 className="title-text text-lg mb-2">{section.title}</h3>
                  {section.content && section.content.map((line, j) => (
                    <p key={j} className="body-text mb-2">
                      {line}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </section>
        </MotionWrapper>
      </div>
    </div>
  );
}
