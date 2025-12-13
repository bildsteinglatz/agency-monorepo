'use client';

import dynamic from 'next/dynamic';

const PdfPreview = dynamic(() => import('./PdfPreview.client'), {
  ssr: false,
  loading: () => <div className="w-[250px] h-[350px] bg-gray-100 animate-pulse rounded-sm" />
});

export default PdfPreview;
