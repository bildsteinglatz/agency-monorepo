import { PortableText, PortableTextComponents } from '@portabletext/react';

const components: PortableTextComponents = {
  block: {
    // Standard paragraph
    normal: ({ children }) => <p className="mb-4 last:mb-0 leading-relaxed">{children}</p>,
    // Headings
    h1: ({ children }) => <h1 className="text-4xl font-black uppercase mb-6">{children}</h1>,
    h2: ({ children }) => <h2 className="text-2xl font-black uppercase mb-4">{children}</h2>,
    h3: ({ children }) => <h3 className="text-xl font-bold uppercase mb-3">{children}</h3>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-[#FF3100] pl-4 italic my-6 font-bold">
        {children}
      </blockquote>
    ),
  },
  marks: {
    // Bold text -> Brutalist Black
    strong: ({ children }) => <strong className="font-black text-black">{children}</strong>,
    // Links -> Underlined and hover effect
    link: ({ value, children }) => {
      const target = (value?.href || '').startsWith('http') ? '_blank' : undefined;
      return (
        <a 
          href={value?.href} 
          target={target} 
          rel={target === '_blank' ? 'noindex nofollow' : undefined}
          className="underline decoration-2 underline-offset-2 hover:text-[#FF3100] transition-colors font-bold"
        >
          {children}
        </a>
      );
    },
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-1 marker:text-[#FF3100]">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-1 marker:font-black">{children}</ol>,
  },
  listItem: {
    bullet: ({ children }) => <li className="">{children}</li>,
    number: ({ children }) => <li className="">{children}</li>,
  },
};

interface Props {
  value: any;
  className?: string;
}

export default function BrutalistPortableText({ value, className = '' }: Props) {
  if (!value) return null;
  
  return (
    <div className={`text-black ${className}`}>
      <PortableText value={value} components={components} />
    </div>
  );
}
