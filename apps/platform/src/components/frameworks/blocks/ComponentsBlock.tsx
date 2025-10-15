'use client';

import dynamic from 'next/dynamic';

// Dynamically import framer-motion components
const MotionSection = dynamic(() => import('framer-motion').then(mod => mod.motion.section), { ssr: false });
const MotionDiv = dynamic(() => import('framer-motion').then(mod => mod.motion.div), { ssr: false });

interface ComponentItem {
  title: string;
  description: string;
  icon?: string;
}

interface ComponentsBlockProps {
  components: ComponentItem[];
}

const ComponentsBlock = ({ components }: ComponentsBlockProps) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
      <div className="max-w-7xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {components.map((component, index) => (
            <MotionDiv
              key={index}
              className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300"
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.3 } }}
            >
              <div className="flex items-start mb-6">
                {component.icon && (
                  <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-md bg-indigo-100 text-indigo-600 mr-4">
                    <img src={component.icon} alt={component.title} className="h-6 w-6 object-contain" />
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900">{component.title}</h3>
              </div>
              <p className="text-gray-600">{component.description}</p>
            </MotionDiv>
          ))}
        </div>
      </div>
    </MotionSection>
  );
};

export default ComponentsBlock;