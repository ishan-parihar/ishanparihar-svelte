'use client';

import dynamic from 'next/dynamic';

// Dynamically import framer-motion components
const MotionSection = dynamic(() => import('framer-motion').then(mod => mod.motion.section), { ssr: false });
const MotionDiv = dynamic(() => import('framer-motion').then(mod => mod.motion.div), { ssr: false });

interface MethodologyBlockProps {
  title: string;
  content: string;
}

const MethodologyBlock = ({ title, content }: MethodologyBlockProps) => {
  // Parse the markdown content to extract methodology steps
  const parseMethodologyContent = (markdownContent: string) => {
    // Extract numbered list items (1., 2., 3., etc.)
    const steps = [];
    const stepMatches = markdownContent.match(/\d+\.\s+(.*?)(?=\n\d+\.|\n*$)/g);
    
    if (stepMatches) {
      for (const match of stepMatches) {
        // Extract the text after the number and period
        const stepText = match.replace(/^\d+\.\s+/, '').trim();
        steps.push(stepText);
      }
    }
    
    return steps;
  };

  const methodologySteps = parseMethodologyContent(content);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <MotionSection
      className="py-16 px-4 sm:px-6 lg:px-8"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <MotionDiv className="text-center mb-16" variants={itemVariants}>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {title}
        </h2>
        <div className="w-24 h-1 bg-indigo-600 mx-auto rounded-full"></div>
      </MotionDiv>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {methodologySteps.map((step, index) => (
          <MotionDiv
            key={index}
            className="flex items-start"
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.3 } }}
          >
            <div className="flex-shrink-0 flex items-center justify-center h-12 w-md bg-indigo-100 text-indigo-600 mr-4">
              <span className="text-lg font-bold">{index + 1}</span>
            </div>
            <p className="text-gray-600">{step}</p>
          </MotionDiv>
        ))}
      </div>
    </MotionSection>
  );
};

export default MethodologyBlock;