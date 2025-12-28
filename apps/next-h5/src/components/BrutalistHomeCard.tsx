'use client';

import { m } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { urlFor } from '@/sanity/image';
import { useState } from 'react';

interface BrutalistHomeCardProps {
  title: string;
  description: string;
  cta: string;
  href: string;
  backgroundImage?: any;
  // Colors
  backgroundColor?: string;
  textColor?: string;
  buttonBackgroundColor?: string;
  buttonTextColor?: string;
  buttonBorderColor?: string;
  buttonHoverBackgroundColor?: string;
  buttonHoverTextColor?: string;
  buttonHoverBorderColor?: string;
}

export default function BrutalistHomeCard({
  title,
  description,
  cta,
  href,
  backgroundImage,
  backgroundColor = '#ffffff',
  textColor = '#000000',
  buttonBackgroundColor = 'transparent',
  buttonTextColor = '#000000',
  buttonBorderColor = '#000000',
  buttonHoverBackgroundColor = '#000000',
  buttonHoverTextColor = '#ffffff',
  buttonHoverBorderColor = '#000000',
}: BrutalistHomeCardProps) {
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      className="h-full"
    >
      <div 
        className="relative border-4 border-black p-8 flex flex-col justify-between h-full min-h-[400px] transition-all overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
        style={{ backgroundColor, color: textColor }}
      >
        {backgroundImage && (
          <div className="absolute inset-0 z-0">
            <Image 
              src={urlFor(backgroundImage).width(800).auto('format').url()} 
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
        
        <div className="relative z-10">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-black uppercase leading-none mb-6 tracking-tighter">
            {title.replace(/ß/g, 'ẞ')}
          </h3>
          <p className="text-base font-bold leading-snug">
            {description}
          </p>
        </div>

        <Link
          href={href}
          prefetch={false}
          onMouseEnter={() => setIsButtonHovered(true)}
          onMouseLeave={() => setIsButtonHovered(false)}
          className="relative z-10 mt-8 inline-block border-4 px-6 py-3 text-lg font-black uppercase text-center transition-all"
          style={{
            backgroundColor: isButtonHovered ? buttonHoverBackgroundColor : buttonBackgroundColor,
            color: isButtonHovered ? buttonHoverTextColor : buttonTextColor,
            borderColor: isButtonHovered ? buttonHoverBorderColor : buttonBorderColor,
          }}
        >
          {cta.replace(/ß/g, 'ẞ')}
        </Link>
      </div>
    </m.div>
  );
}
