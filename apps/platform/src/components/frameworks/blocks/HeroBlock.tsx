import React from 'react';

interface HeroBlockProps {
  title: string;
  subtitle: string;
}

const HeroBlock: React.FC<HeroBlockProps> = ({ title, subtitle }) => {
  return (
   <div className="relative bg-gradient-consciousness py-20 px-4 sm:px-6 lg:px-8">
   <div className="max-w-7xl mx-auto text-center">
   <h1 className="text-4xl md:text-5xl font-bold font-headings text-primary leading-tight tracking-tight mb-4 text-glow-soft">
   {title}
   </h1>
   <p className="mt-4 max-w-2xl text-xl text-secondary mx-auto">
    {subtitle}
   </p>
   </div>
   </div>
  );
};

export default HeroBlock;