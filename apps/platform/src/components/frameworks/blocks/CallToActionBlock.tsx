import React from 'react';
import Link from 'next/link';

interface CallToActionBlockProps {
  headline: string;
  buttonText: string;
  buttonLink: string;
}

const CallToActionBlock: React.FC<CallToActionBlockProps> = ({
  headline,
  buttonText,
  buttonLink
}) => {
  return (
   <div className="bg-gradient-consciousness py-16 px-4 sm:px-6 lg:px-8">
   <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold font-headings text-primary leading-tight tracking-tight mb-8 text-glow-soft">
          {headline}
        </h2>
        <div className="mt-10">
          <Link
            href={buttonLink}
   className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-cosmos bg-primary hover:bg-consciousness transition duration-300 ease-in-out transform hover:scale-105 hover:text-white"
   >
    {buttonText}
    </Link>
   </div>
   </div>
   </div>
  );
};

export default CallToActionBlock;