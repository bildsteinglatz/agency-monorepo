import Link from 'next/link';
import { Navigation } from '@/components/Navigation';

export default function TextNotFound() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <h1 className="text-4xl font-light mb-6">Text Not Found</h1>
        <p className="text-xl mb-8 text-black dark:text-black">
          Sorry, the text you&apos;re looking for doesn&apos;t exist or may have been removed.
        </p>
        <Link 
          href="/texts" 
          className="inline-flex items-center px-4 py-2 border border-black text-base font-medium rounded-md text-black bg-white hover:bg-white dark:bg-black dark:text-black dark:border-black dark:hover:bg-white"
        >
          Return to all texts
        </Link>
      </div>
    </div>
  );
}
