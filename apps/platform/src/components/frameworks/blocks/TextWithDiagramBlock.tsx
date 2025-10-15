import React from 'react';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';

interface TextWithDiagramBlockProps {
  textSide: 'left' | 'right';
  markdownContent: string;
  imageUrl: string;
  imageAlt: string;
}

const TextWithDiagramBlock: React.FC<TextWithDiagramBlockProps> = ({
  textSide,
  markdownContent,
  imageUrl,
  imageAlt
}) => {
  const textOrderClass = textSide === 'left' ? 'md:order-1' : 'md:order-2';
  const imageOrderClass = textSide === 'left' ? 'md:order-2' : 'md:order-1';

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background to-secondary/5">
   <div className="max-w-7xl mx-auto">
   <div className="md:flex md:items-center md:gap-16">
   <div className={`md:w-1/2 ${textOrderClass}`}>
    <div className="prose prose-lg max-w-none text-foreground">
   <ReactMarkdown
    components={{
   h1: ({node, ...props}) => <h1 className="text-3xl font-bold font-headings text-primary mb-4" {...props} />,
    h2: ({node, ...props}) => <h2 className="text-2xl font-bold font-headings text-primary mb-3" {...props} />,
    h3: ({node, ...props}) => <h3 className="text-xl font-bold font-headings text-primary mb-2" {...props} />,
    p: ({node, ...props}) => <p className="mb-4 text-lg text-secondary" {...props} />,
    ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 space-y-2" {...props} />,
   ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4 space-y-2" {...props} />,
    li: ({node, ...props}) => <li className="text-secondary" {...props} />,
   strong: ({node, ...props}) => <strong className="font-bold text-primary" {...props} />,
   em: ({node, ...props}) => <em className="italic" {...props} />,
    }}
   >
    {markdownContent}
   </ReactMarkdown>
   </div>
   </div>
   <div className={`md:w-1/2 ${imageOrderClass} mt-12 md:mt-0 flex justify-center`}>
   <div className="relative">
   <div className="absolute inset-0 bg-gradient-consciousness rounded-2xl transform rotate-3 blur-xl opacity-20"></div>
   <Image
   src={imageUrl}
   alt={imageAlt}
   width={500}
   height={500}
   className="relative rounded-2xl shadow-2xl max-w-full h-auto border-8 border-white"
   />
   </div>
   </div>
    </div>
    </div>
    </div>
  );
};

export default TextWithDiagramBlock;