import { MotionWrapper } from '@/components/MotionWrapper';

export const metadata = {
  title: 'About & Legal | Bildstein/Glatz',
  description: 'About Bildstein/Glatz.',
};

export default function About() {
  return (
    <div className="min-h-screen">
      {/* Navigation component is now rendered in layout.tsx */}
      <div className="max-w-4xl mx-auto px-6 pt-24 pb-20">
        {/* Invisible SEO title */}
        <h1 className="sr-only">About & Legal</h1>
        <MotionWrapper delay={0.9} yOffset={50}>
          <div className="space-y-8">
            {/* All static sections are wrapped in this parent div */}
          </div>
        </MotionWrapper>
      </div>
    </div>
  );
}
