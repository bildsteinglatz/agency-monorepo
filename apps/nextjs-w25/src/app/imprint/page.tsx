import ImprintActions from '@/components/imprint/ImprintActions';
import { imprintData } from '@/data/imprint';
import { MotionWrapper } from '@/components/MotionWrapper';

export const metadata = {
  title: 'Imprint | Bildstein | Glatz',
  description: 'Imprint for Bildstein | Glatz.',
};

export default function Imprint() {
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-6 pt-24 pb-20">
        <h1 className="sr-only">Imprint</h1>
        <MotionWrapper delay={0.9} yOffset={50}>
        <div className="space-y-0">
          
          {/* IMPRESSUM */}
          <section id="imprint" className="scroll-mt-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="title-text text-xl mb-0">{imprintData.impressum.title}</h2>
                <p className="body-text">{imprintData.impressum.intro}</p>
              </div>
              <ImprintActions />
            </div>

            <div className="space-y-8">
              <div>
                {imprintData.impressum.sections.map((section, i) => (
                  <div key={i} className="mb-6">
                    <h3 className="title-text text-lg mb-0">{section.title}</h3>
                    <div className="body-text">
                      {section.content.map((line, j) => (
                        <p key={j} dangerouslySetInnerHTML={{ 
                          __html: line
                            .replace(/office@bildsteinglatz.com/g, '<a href="mailto:office@bildsteinglatz.com" class="hover:text-accent transition-colors">office@bildsteinglatz.com</a>')
                            .replace(/\+43\(0\)699 11190126/g, '<a href="tel:+4369911190126" class="hover:text-accent transition-colors">+43(0)699 11190126</a>')
                        }} />
                      ))}
                    </div>
                  </div>
                ))}
                
                <h3 className="title-text text-lg mb-2">Copyright</h3>
                <p className="body-text text-sm">
                  {imprintData.impressum.copyright.map((line, i) => (
                    <span key={i} className="block">{line}</span>
                  ))}
                </p>
              </div>
            </div>
          </section>

          {/* PRIVACY */}
          <section id="privacy" className="scroll-mt-0 pt-16">
            <h2 className="title-text text-xl mb-0">{imprintData.privacy.title}</h2>
            <p className="body-text mb-8 whitespace-pre-line">
              {imprintData.privacy.intro}
            </p>

            <div className="space-y-8">
              <div>
                {imprintData.privacy.sections.map((section, i) => (
                  <div key={i} className="mb-8">
                    <h3 className="title-text text-lg mb-0">{section.title}</h3>
                    {section.content && section.content.map((line, j) => (
                      <p key={j} className="body-text mb-2" dangerouslySetInnerHTML={{
                        __html: line.replace(/office@bildsteinglatz.com/g, '<a href="mailto:office@bildsteinglatz.com" class="hover:text-accent transition-colors">office@bildsteinglatz.com</a>')
                      }} />
                    ))}
                    
                    {section.subsections && section.subsections.map((sub, k) => (
                      <div key={k} className="mt-4">
                        <h4 className="title-text text-base font-bold mt-4 mb-0">{sub.title}</h4>
                        {sub.content.map((line, l) => (
                          <p key={l} className="body-text mb-2">{line}</p>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
        </MotionWrapper>
      </div>
    </div>
  );
}
