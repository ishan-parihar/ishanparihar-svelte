import { notFound } from 'next/navigation';
import { FRAMEWORK_CATEGORIES } from '@/lib/framework-data';
import HeroBlock from '@/components/frameworks/blocks/HeroBlock';
import TextWithDiagramBlock from '@/components/frameworks/blocks/TextWithDiagramBlock';
import CallToActionBlock from '@/components/frameworks/blocks/CallToActionBlock';
import KeyPillarsBlock from '@/components/frameworks/blocks/KeyPillarsBlock';
import OverviewBlock from '@/components/frameworks/blocks/OverviewBlock';
import ComponentsBlock from '@/components/frameworks/blocks/ComponentsBlock';
import RoadmapBlock from '@/components/frameworks/blocks/RoadmapBlock';
import CaseStudyBlock from '@/components/frameworks/blocks/CaseStudyBlock';
import MethodologyBlock from '@/components/frameworks/blocks/MethodologyBlock';
import { ContentBlock, FrameworkCategory, Framework } from '@/types/framework';

// Helper function to parse roadmap markdown content
const parseRoadmapContent = (markdownContent: string) => {
  const phases = [];
  
  // Extract phase titles and descriptions
  const phaseMatches = markdownContent.matchAll(/\*\*Phase \d+: ([^\*]+)\*\*\n([\s\S]*?)(?=\n\d+:|\n*$)/g);
  
  for (const match of phaseMatches) {
    phases.push({
      title: `Phase ${phases.length + 1}: ${match[1].trim()}`,
      description: match[2].trim()
    });
  }
  
  return phases;
};

// Helper function to parse case study markdown content
const parseCaseStudyContent = (markdownContent: string) => {
  // Extract client name from the title
  const clientRegex = /## Case Study: (.*)/;
  const clientMatch = markdownContent.match(clientRegex);
  const clientName = clientMatch ? clientMatch[1] : 'Client';
  
  // Extract challenge, solution, and outcome sections
  const challengeRegex = /\*\*The Challenge\*\*\n([\s\S]*?)(?=\n\*\*The Solution|\n\*\*The Outcome|\n*$)/;
  const solutionRegex = /\*\*The Solution\*\*\n([\s\S]*?)(?=\n\*\*The Outcome|\n*$)/;
  const outcomeRegex = /\*\*The Outcome\*\*\n([\s\S]*?)(?=\n*$)/;
  
  const challengeMatch = markdownContent.match(challengeRegex);
  const solutionMatch = markdownContent.match(solutionRegex);
  const outcomeMatch = markdownContent.match(outcomeRegex);
  
  return {
    clientName,
    challenge: challengeMatch ? challengeMatch[1].trim() : '',
    solution: solutionMatch ? solutionMatch[1].trim() : '',
    outcome: outcomeMatch ? outcomeMatch[1].trim() : ''
  };
};

interface PageProps {
  params: Promise<{ 'category-slug': string; 'framework-slug': string; }>;
}

// Server component - default export
export default async function FrameworkPage({ params }: PageProps) {
  // Resolve params promise
  const resolvedParams = await params;
  
  // Find the category by slug
  const category = FRAMEWORK_CATEGORIES.find(
    (cat: FrameworkCategory) => cat.slug === resolvedParams['category-slug']
  );

  if (!category) {
    notFound();
  }

  // Find the framework within the category
  const framework = category.frameworks.find(
    (fw: Framework) => fw.slug === resolvedParams['framework-slug']
  );

  if (!framework) {
    notFound();
  }

  // Render the content blocks dynamically
  return (
    <div className="min-h-screen">
      {framework.contentBlocks?.map((block, index) => {
        // Type guard to ensure proper type narrowing
        if (block && typeof block === 'object' && 'type' in block && 'content' in block) {
          switch (block.type) {
            case 'hero':
              return <HeroBlock key={index} {...block.content} />;
            case 'overview':
              return <OverviewBlock key={index} {...block.content} />;
            case 'components':
              // Check if it's the financial components structure or the emotional intelligence structure
              if ('components' in block.content) {
                return <ComponentsBlock key={index} components={block.content.components} />;
              } else {
                return <ComponentsBlock key={index} components={block.content.pillars} />;
              }
            case 'roadmap':
              // Check if it's the financial roadmap structure or the emotional intelligence structure
              if ('phases' in block.content) {
                return <RoadmapBlock key={index} phases={block.content.phases} />;
              } else {
                // Parse the markdown content to extract phases
                const roadmapPhases = parseRoadmapContent(block.content.markdownContent);
                return <RoadmapBlock key={index} phases={roadmapPhases} />;
              }
            case 'caseStudy':
              // Check if it's the financial case study structure or the emotional intelligence structure
              if ('clientName' in block.content) {
                return <CaseStudyBlock key={index} {...block.content} />;
              } else {
                // Parse the markdown content to extract client info, challenge, solution, and outcome
                const caseStudyData = parseCaseStudyContent(block.content.markdownContent);
                return <CaseStudyBlock key={index} {...caseStudyData} />;
              }
            case 'methodology':
              // Check if it's the financial methodology structure or the emotional intelligence structure
              if ('title' in block.content && 'content' in block.content) {
                return <MethodologyBlock key={index} title={block.content.title} content={block.content.content} />;
              } else {
                // For methodology, we need to extract title and content
                return <MethodologyBlock key={index} title="Methodology" content={block.content.markdownContent} />;
              }
            case 'cta':
              return <CallToActionBlock key={index} {...block.content} />;
            default:
              console.warn(`Unknown block type: ${(block as ContentBlock).type}`);
              return null;
          }
        }
        return null;
      })}
    </div>
  );
}