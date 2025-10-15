interface HeroBlockData {
  title: string;
  subtitle: string;
}

interface TextWithDiagramBlockData {
  textSide: 'left' | 'right';
  markdownContent: string;
  imageUrl: string;
  imageAlt: string;
}

interface CallToActionBlockData {
  headline: string;
  buttonText: string;
  buttonLink: string;
}

interface KeyPillar {
  title: string;
  description: string;
  icon?: string;
}

interface KeyPillarsBlockData {
  pillars: KeyPillar[];
}

// New block data types for the emotional intelligence framework
interface OverviewBlockData {
  problem: string;
  valueProp: string;
  roi: string;
}

interface ComponentsBlockData {
  pillars: KeyPillar[];
}

// New block data types for the financial intelligence framework
interface FinancialComponentsBlockData {
  components: KeyPillar[];
}

interface FinancialRoadmapBlockData {
  phases: {
    title: string;
    description: string;
  }[];
}

interface FinancialCaseStudyBlockData {
  clientName: string;
  challenge: string;
  solution: string;
  outcome: string;
}

interface FinancialMethodologyBlockData {
  title: string;
  content: string;
}

// New block data types for the cognitive intelligence framework
interface CognitiveComponentsBlockData {
  components: KeyPillar[];
}

interface CognitiveRoadmapBlockData {
  phases: {
    title: string;
    description: string;
  }[];
}

interface CognitiveCaseStudyBlockData {
  clientName: string;
  challenge: string;
  solution: string;
  outcome: string;
}

interface CognitiveMethodologyBlockData {
  title: string;
  content: string;
}

interface RoadmapBlockData {
  textSide: 'left' | 'right';
  markdownContent: string;
  imageUrl: string;
  imageAlt: string;
}

interface CaseStudyBlockData {
  textSide: 'left' | 'right';
  markdownContent: string;
  imageUrl: string;
  imageAlt: string;
}

interface MethodologyBlockData {
  textSide: 'left' | 'right';
  markdownContent: string;
  imageUrl: string;
  imageAlt: string;
}

type ContentBlock =
  | { type: 'hero'; content: HeroBlockData }
  | { type: 'overview'; content: OverviewBlockData }
  | { type: 'components'; content: ComponentsBlockData | FinancialComponentsBlockData | CognitiveComponentsBlockData }
  | { type: 'roadmap'; content: RoadmapBlockData | FinancialRoadmapBlockData | CognitiveRoadmapBlockData }
  | { type: 'caseStudy'; content: CaseStudyBlockData | FinancialCaseStudyBlockData | CognitiveCaseStudyBlockData }
  | { type: 'methodology'; content: MethodologyBlockData | FinancialMethodologyBlockData | CognitiveMethodologyBlockData }
  | { type: 'cta'; content: CallToActionBlockData };

interface Framework {
  slug: string;
  name: string;
  description: string;
  logo: string;
  url: string;
  contentBlocks?: ContentBlock[];
}

interface FrameworkCategory {
  slug: string;
  title: string;
  description: string;
  frameworks: Framework[];
}

export type { Framework, FrameworkCategory, ContentBlock, HeroBlockData, TextWithDiagramBlockData, CallToActionBlockData, KeyPillarsBlockData, KeyPillar, OverviewBlockData, ComponentsBlockData, RoadmapBlockData, CaseStudyBlockData, MethodologyBlockData, FinancialComponentsBlockData, FinancialRoadmapBlockData, FinancialCaseStudyBlockData, FinancialMethodologyBlockData, CognitiveComponentsBlockData, CognitiveRoadmapBlockData, CognitiveCaseStudyBlockData, CognitiveMethodologyBlockData };