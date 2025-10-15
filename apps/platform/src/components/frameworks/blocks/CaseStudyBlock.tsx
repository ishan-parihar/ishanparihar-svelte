'use client';

import dynamic from 'next/dynamic';

// Dynamically import framer-motion components
const MotionSection = dynamic(() => import('framer-motion').then(mod => mod.motion.section), { ssr: false });
const MotionDiv = dynamic(() => import('framer-motion').then(mod => mod.motion.div), { ssr: false });

interface CaseStudyBlockProps {
  clientName: string;
  challenge: string;
  solution: string;
  outcome: string;
}

const CaseStudyBlock = ({ clientName, challenge, solution, outcome }: CaseStudyBlockProps) => {
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
      className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <div className="max-w-7xl mx-auto">
        <MotionDiv className="text-center mb-16" variants={itemVariants}>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Case Study: {clientName}
          </h2>
          <div className="w-24 h-1 bg-indigo-600 mx-auto rounded-full"></div>
        </MotionDiv>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Challenge Card */}
          <MotionDiv
            className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
            variants={itemVariants}
            whileHover={{ y: -10, transition: { duration: 0.3 } }}
          >
            <div className="flex items-center mb-6">
              <div className="flex-shrink-0 flex items-center justify-center h-12 rounded-md bg-red-100 text-red-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="ml-4 text-xl font-bold text-gray-900">The Challenge</h3>
            </div>
            <p className="text-gray-600">{challenge}</p>
          </MotionDiv>

          {/* Solution Card */}
          <MotionDiv
            className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
            variants={itemVariants}
            whileHover={{ y: -10, transition: { duration: 0.3 } }}
          >
            <div className="flex items-center mb-6">
              <div className="flex-shrink-0 flex items-center justify-center h-12 rounded-md bg-blue-100 text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="ml-4 text-xl font-bold text-gray-900">Our Solution</h3>
            </div>
            <p className="text-gray-600">{solution}</p>
          </MotionDiv>

          {/* Outcome Card */}
          <MotionDiv
            className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
            variants={itemVariants}
            whileHover={{ y: -10, transition: { duration: 0.3 } }}
          >
            <div className="flex items-center mb-6">
              <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-md bg-green-100 text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="ml-4 text-xl font-bold text-gray-900">The Outcome</h3>
            </div>
            <p className="text-gray-600">{outcome}</p>
          </MotionDiv>
        </div>
      </div>
    </MotionSection>
  );
};

export default CaseStudyBlock;