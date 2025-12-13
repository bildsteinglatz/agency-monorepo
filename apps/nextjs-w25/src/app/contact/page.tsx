import { MotionWrapper } from '@/components/MotionWrapper';
import { HighFive } from '@/components/HighFive';
import { NewsletterSignup } from '@/components/NewsletterSignup';

export const metadata = {
  title: 'Contact | Bildstein | Glatz',
  description: 'Contact information for Bildstein | Glatz.',
};

export default function Contact() {
  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-6 pt-24 pb-20">
        <h1 className="sr-only">Contact</h1>
        <MotionWrapper delay={0.9} yOffset={50}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24">
            {/* Left Column: Contact Info */}
            <div className="space-y-8">
              <section id="contact" className="scroll-mt-32">
                <div className="space-y-4">
                  <div>
                    <h4 className="title-text mb-2">Atelier Dornbirn</h4>
                    <p className="body-text">
                      Bildstein | Glatz<br />
                      Halle 5, Spinnergasse 1<br />
                      6850 Dornbirn, Österreich<br />
                      <a href="https://www.halle5.at" target="_blank" rel="noopener noreferrer">www.halle5.at</a>
                    </p>
                  </div>
                  <div>
                    <h4 className="title-text mb-2">Atelier Wien</h4>
                    <p className="body-text">
                      Bildstein | Glatz<br />
                      Medwedweg 3<br />
                      1110 Wien, Österreich
                    </p>
                  </div>
                  <div>
                    <h4 className="title-text mb-2">Contact</h4>
                    <p className="body-text">
                      <a href="mailto:office@bildsteinglatz.com">office@bildsteinglatz.com</a>
                    </p>
                  </div>
                </div>
              </section>
              <section>
                <h3 className="title-text text-lg mb-1">Representation</h3>
                <div>
                  <h4 className="title-text mb-2">c.art, Prantl & Boch</h4>
                  <p className="body-text">
                    Dr. Anton Schneider Straße 28b<br />
                    A-6850 Dornbirn<br />
                    Tel: +43 5572 31 2 31-0<br />
                    <a href="mailto:office@cart.co.at">office@cart.co.at</a><br />
                    <a href="https://www.c-art.at/" target="_blank" rel="noopener noreferrer">www.c-art.at</a>
                  </p>
                </div>
              </section>
            </div>

            {/* Right Column: Newsletter Signup */}
            <div>
              <NewsletterSignup />
            </div>
          </div>
          
          <section className="pt-12">
            <HighFive />
          </section>
        </MotionWrapper>
      </div>
    </div>
  );
}
