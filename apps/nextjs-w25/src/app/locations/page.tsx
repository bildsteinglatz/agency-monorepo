import StudioMap from '@/components/StudioMap';
import { MotionWrapper } from '@/components/MotionWrapper';

export const metadata = {
  title: 'Locations | Bildstein | Glatz',
  description: 'Locations of Bildstein | Glatz studios.',
};

export default function Locations() {
  return (
    <div className="w-full fixed top-0 bottom-0 left-0 right-0 overflow-hidden z-0">
      <h1 className="sr-only">Locations</h1>
      <MotionWrapper delay={0.9} yOffset={50} className="h-full w-full">
        <StudioMap />
      </MotionWrapper>
    </div>
  );
}
