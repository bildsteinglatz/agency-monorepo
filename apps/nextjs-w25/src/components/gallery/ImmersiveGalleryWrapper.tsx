'use client';

import dynamic from 'next/dynamic';
import { ArtworkData } from '@/types';

const ImmersiveGallery = dynamic(
  () => import('./ImmersiveGallery').then(mod => mod.ImmersiveGallery),
  { ssr: false }
);

export default function ImmersiveGalleryWrapper({ initialArtworkData }: { initialArtworkData: ArtworkData[] }) {
  return <ImmersiveGallery initialArtworkData={initialArtworkData} />;
}
