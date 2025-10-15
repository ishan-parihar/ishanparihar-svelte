import React from 'react';

interface KeyPillarsBlockProps {
  pillars: {
   title: string;
   description: string;
   icon?: string;
  }[];
}

const KeyPillarsBlock: React.FC<KeyPillarsBlockProps> = ({ pillars }) => {
  return (
   <div className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background to-secondary/5">
   <div className="max-w-7xl mx-auto">
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
   {pillars.map((pillar, index) => (
   <div 
   key={index}
   className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-shadow duration-300"
   >
    {pillar.icon && (
   <div className="mb-4">
   <img src={pillar.icon} alt={pillar.title} className="w-12 h-12 object-contain" />
   </div>
   )}
   <h3 className="text-xl font-bold font-headings text-primary mb-3">
   {pillar.title}
   </h3>
   <p className="text-secondary">
   {pillar.description}
   </p>
   </div>
   ))}
    </div>
   </div>
   </div>
  );
};

export default KeyPillarsBlock;