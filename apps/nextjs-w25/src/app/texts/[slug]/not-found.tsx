import Link from 'next/link';
import { Navigation } from '@/components/Navigation';

export default function TextNotFound() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <h1 className="text-4xl font-light mb-6">Text Not Found</h1>
        <p className="text-xl mb-8 text-gray-600 dark:text-gray-300">
          Sorry, the text you&apos;re looking for doesn&apos;t exist or may have been removed.
        </p>
        <Link 
          href="/texts" 
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-black dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-900"
        >
          Return to all texts
        </Link>
      </div>
    </div>
  );
}
