import { motion } from 'framer-motion';

interface AssessmentBlockProps {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

const AssessmentBlock = ({ title, description, buttonText, buttonLink }: AssessmentBlockProps) => {
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
    <motion.section
      className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <div className="max-w-4xl mx-auto text-center">
        <motion.div className="mb-8" variants={itemVariants}>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <div className="w-24 h-1 bg-indigo-600 mx-auto rounded-full"></div>
        </motion.div>

        <motion.p 
          className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto"
          variants={itemVariants}
        >
          {description}
        </motion.p>

        <motion.div variants={itemVariants}>
          <a
            href={buttonLink}
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-full text-lg transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 shadow-lg"
          >
            {buttonText}
          </a>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default AssessmentBlock;