import { type FrameworkCategory } from '@/types/framework';

export const FRAMEWORK_CATEGORIES: FrameworkCategory[] = [
  {
  slug: 'individual-intelligence',
  title: 'Individual Intelligence',
  description: 'Mastering the inner world to unlock personal potential and cognitive agility.',
   frameworks: [
  {
  slug: 'emotional-intelligence',
  name: 'Emotional Intelligence',
  description: 'Navigate the world with greater self-awareness and empathy.',
   logo: '/assets/frameworks/ei/logo.svg',
   url: '/frameworks/individual-intelligence/emotional-intelligence',
   contentBlocks: [
    {
   type: 'hero',
   content: {
     title: "Emotional Intelligence: The Architecture of Influence",
     subtitle: "Mastering the inner world to effectively lead, connect, and create tangible results in the outer world."
   }
 },
 {
   type: 'overview',
   content: {
     problem: "In leadership, IQ and technical skill are table stakes. They get you in the game, but they don't win it. The true barrier to elite performance is the inability to navigate the complex human dynamics of a team, a client, or a boardroom. This gap leads to project failures, high employee turnover, and stalled careers.",
     valueProp: "Emotional Intelligence (EQ) is the meta-skill of the modern leader. It is the core capacity to perceive, understand, and regulate emotions—first in yourself, then in others—to build high-trust teams, drive resonant change, and unlock discretionary effort.",
     roi: "Our methodology moves EQ from a 'soft skill' to a hard asset. Organizations that integrate this framework see a direct correlation with performance metrics: leadership effectiveness increases by up to 45%, team collaboration improves by 35%, and employee retention rates climb by over 25%."
   }
 },
 {
   type: 'components',
   content: {
     pillars: [
       { title: "Self-Awareness", description: "The foundation. The ability to recognize your own emotional state, triggers, and tendencies with radical honesty." },
       { title: "Self-Regulation", description: "The discipline. The capacity to manage your impulses and reactions, choosing a considered response over a conditioned reflex." },
       { title: "Motivation", description: "The drive. Harnessing your emotional energy to pursue goals with passion and persistence, especially in the face of setbacks." },
       { title: "Empathy", description: "The connection. The skill of accurately sensing and understanding the emotional states of others to build genuine rapport and trust." },
       { title: "Social Skills", description: "The influence. The art of applying emotional understanding to build networks, manage conflict, and inspire collective action." }
     ]
   }
 },
 {
   type: 'roadmap',
   content: {
     textSide: 'right',
     markdownContent: `## Implementation Roadmap\n\n**Phase 1: Foundational Assessment**\nWe begin with a comprehensive diagnostic of individual and team EQ levels, establishing a clear, data-driven baseline.\n\n**Phase 2: Core Competency Development**\nThrough targeted workshops and executive coaching, we build core capacity in the five key pillars of emotional intelligence.\n\n**Phase 3: Real-World Integration**\nWe embed EQ practices directly into your team's workflow, decision-making processes, and communication protocols for sustainable change.`,
     imageUrl: '/assets/frameworks/ei/roadmap.png',
     imageAlt: 'Implementation Roadmap'
   }
 },
 {
   type: 'caseStudy',
   content: {
     textSide: 'left',
     markdownContent: `## Case Study: Global Tech Firm, Fortune 500\n\n**The Challenge**\nA brilliant engineering division was consistently missing deadlines. Technical reviews revealed their code was excellent, but team dynamics were toxic. Interpersonal friction and poor communication were crippling their ability to execute.\n\n**The Solution**\nWe deployed a 6-month EQ integration program for the division's leadership. The intervention focused on building Empathy to bridge communication gaps and Self-Regulation to handle high-pressure feedback cycles constructively.\n\n**The Outcome**\nWithin one year, the division saw a 40% reduction in project completion times and a 60% decrease in voluntary employee turnover. They are now the company's highest-performing engineering unit.`,
     imageUrl: '/assets/frameworks/ei/case-study.png',
     imageAlt: 'Case Study Results'
   }
 },
 {
   type: 'methodology',
   content: {
     textSide: 'right',
     markdownContent: `## Beyond the Pillars: Our Integrated Approach\n\nWe don't just teach the five pillars of EQ. Our unique value lies in our 'Tri-Framework Integration.' We use **Attachment Theory** to uncover the deep-seated relational patterns that drive team dynamics and **Systems Theory** to map how emotional currents impact the entire organizational structure. This creates insights that are not just profound, but systemically actionable.`,
     imageUrl: '/assets/frameworks/ei/methodology.png',
     imageAlt: 'Methodology Framework'
   }
 },
 {
   type: 'cta',
   content: {
     headline: "Ready to Build Your Emotional Architecture?",
     buttonText: "Schedule a Strategic Consultation",
     buttonLink: "/contact"
   }
 }
    ],
   },
   {
     slug: "financial-intelligence",
     name: "Financial Intelligence",
     description: "Architecting a resilient, self-sustaining system of personal wealth.",
     logo: "/assets/frameworks/fi/logo.svg",
     url: "/frameworks/individual-intelligence/financial-intelligence",
     contentBlocks: [
       {
         type: 'hero',
         content: {
           title: "Financial Intelligence: Architecting Economic Freedom",
           subtitle: "Moving beyond income generation to build a resilient, self-sustaining architecture of personal wealth."
         }
       },
       {
         type: 'overview',
         content: {
           problem: "Many high-achievers are trapped in a cycle of high income but low net worth. They are experts at earning money, but novices at keeping and growing it. This 'golden handcuff' scenario creates immense stress, limits optionality, and leaves their financial future vulnerable to market shocks and career changes.",
           valueProp: "True Financial Intelligence is the systemic capacity to allocate capital—your time, energy, and money—to build an ever-growing asset base. It's about transforming active income into a portfolio of passive cash-flow streams, creating a robust system that works for you, not the other way around.",
           roi: "Clients who implement this framework fundamentally shift their financial trajectory, typically accelerating their path to financial independence by 30-50%. They don't just increase their net worth; they buy back their time and build a legacy of generational wealth."
         }
       },
       {
         type: 'components',
         content: {
           components: [
             { title: "Layer 1: Foundational Mechanics", description: "Mastering the physics of wealth: the non-negotiable interplay of Income, Expenses, Assets, and Liabilities. We apply Asset-Liability Management (ALM) Theory, typically reserved for banks, to your personal balance sheet.", icon: "database" },
             { title: "Layer 2: Strategic Positioning", description: "Utilizing the Cashflow Quadrant to strategically shift your primary income source from active (Employee/Self-Employed) to passive (Business Owner/Investor), fundamentally altering your relationship with time and money.", icon: "compass" },
             { title: "Layer 3: Growth Optimization", description: "Developing a sophisticated Investment Intelligence Framework to deploy capital effectively, manage risk, and compound growth across multiple asset classes.", icon: "trending-up" }
           ]
         }
       },
       {
         type: 'roadmap',
         content: {
           phases: [
             { title: "Phase 1: Financial Baseline Audit", description: "A forensic analysis of your current financial state, identifying inefficiencies, risks, and hidden opportunities in your cash flow and balance sheet." },
             { title: "Phase 2: Wealth System Design", description: "We co-architect your personal financial system, creating automated capital allocation pathways from income to investment engines." },
             { title: "Phase 3: Advanced Capital Allocation", description: "Implementing a diversified, multi-asset investment strategy aligned with your long-term goals for capital preservation and asymmetric growth." }
           ]
         }
       },
       {
         type: 'caseStudy',
         content: {
           clientName: "Founder, High-Growth Tech Startup",
           challenge: "A founder exited his company with a multi-million dollar windfall but lacked a system to manage it. He was overwhelmed by unstructured advice and at risk of wealth depletion through poor tax planning and ad-hoc investments.",
           solution: "We implemented the 3-Layer Financial Intelligence stack. We first established a robust ALM structure, then designed a system to convert the cash into a diversified portfolio of income-producing assets, strategically positioning him as a full-time investor.",
           outcome: "The client successfully preserved 95% of his post-tax exit capital and built a passive income stream that covers 150% of his lifestyle expenses, achieving complete financial freedom within 18 months."
         }
       },
       {
         type: 'methodology',
         content: {
           title: "Finance as a System, Not a Spreadsheet",
           content: "Our approach transcends typical financial planning. We apply **Systems Theory** to view your finances as a complex, dynamic ecosystem. We then use principles from **Cognitive Intelligence** to identify and rewire the limiting beliefs and biases that sabotage financial success, ensuring the system you build is one you can actually execute."
         }
       },
       {
         type: 'cta',
         content: {
           headline: "Ready to Design Your Wealth Architecture?",
           buttonText: "Book a Financial Strategy Session",
           buttonLink: "/contact"
         }
       }
     ]
   },
   {
     name: "Cognitive Intelligence",
     slug: "cognitive-intelligence",
     description: "Upgrading your mental operating system to master complexity.",
     logo: "/assets/frameworks/cognitive-intelligence.svg",
     url: "/frameworks/individual-intelligence/cognitive-intelligence",
     contentBlocks: [
       {
         type: 'hero',
         content: {
           title: "Cognitive Intelligence: Upgrading Your Mental Operating System",
           subtitle: "Moving from solving complex problems to redesigning the systems that create them."
         }
       },
       {
         type: 'overview',
         content: {
           problem: "The most dangerous barrier to a leader's growth is the success of their current thinking model. In a world of accelerating complexity, relying on yesterday's logic to solve tomorrow's problems leads to strategic blind spots, intractable conflicts, and organizational stagnation.",
           valueProp: "Cognitive Intelligence is the capacity to deliberately evolve the complexity of your own thinking. It is the meta-ability to hold multiple, contradictory perspectives, identify hidden assumptions, and see the systemic patterns that others miss. It is the difference between managing complexity and mastering it.",
           roi: "Leaders who cultivate higher cognitive complexity build 5x more adaptive teams, make strategic decisions with 70% greater accuracy under uncertainty, and are capable of leading true, systemic transformation, not just incremental change. This is the single highest-leverage investment in leadership capability."
         }
       },
       {
         type: 'components',
         content: {
           components: [
             { title: "Level 1: The Expert Mind", description: "The foundation of success. Optimizes for execution and problem-solving within a known system. This mind seeks the 'right answer'.", icon: "target" },
             { title: "Level 2: The Strategic Mind", description: "The architect of success. Begins to question and improve the system itself, not just operate within it. This mind seeks the 'best strategy'.", icon: "network" },
             { title: "Level 3: The Systemic Mind", description: "The creator of new possibilities. Sees the entire ecosystem, holds multiple strategies at once, and redesigns the underlying game. This mind seeks 'transformative potential'.", icon: "brain-circuit" }
           ]
         }
       },
       {
         type: 'roadmap',
         content: {
           phases: [
             { title: "Phase 1: Cognitive Baseline Mapping", description: "We utilize advanced assessment tools to map your current 'mental operating system' and identify your primary mode of thinking under pressure." },
             { title: "Phase 2: Perspective Scaffolding", description: "Through a series of targeted interventions, we challenge your core assumptions and introduce new, more complex models for interpreting reality." },
             { title: "Phase 3: Systemic Application", description: "You apply these elevated cognitive abilities to your most pressing, complex business challenges, transforming theory into tangible strategic outcomes." }
           ]
         }
       },
       {
         type: 'caseStudy',
         content: {
           clientName: "CEO, Legacy Manufacturing Firm",
           challenge: "A highly effective CEO was struggling to counter market disruption. Their 'Expert Mind' was brilliant at optimizing existing production lines but was blind to the systemic shift in consumer behavior that was making their entire business model obsolete.",
           solution: "Our engagement focused on a guided evolution to a 'Systemic Mind.' We used strategic simulations to model the entire market ecosystem, forcing a shift from optimizing internal processes to redesigning the company's place in the value chain.",
           outcome: "The CEO led a successful pivot from a product-centric to a service-centric business model, capturing a new market segment and increasing revenues by 40% in two years, avoiding what would have been an inevitable decline."
         }
       },
       {
         type: 'methodology',
         content: {
           title: "Beyond 'Thinking Harder'",
           content: "Our methodology is a synthesis of the world's most robust adult development models. We integrate Robert Kegan's stages of development with the cognitive altitudes of **Integral Theory** and the value systems of **Spiral Dynamics**. This provides a precise, multi-dimensional map of your cognitive landscape, allowing for interventions that catalyze, rather than just encourage, developmental growth."
         }
       },
       {
         type: 'cta',
         content: {
           headline: "Ready to Evolve Your Leadership Mind?",
           buttonText: "Schedule a Consultation",
           buttonLink: "/contact"
         }
       }
     ]
   },
   {
     name: "Spiritual Intelligence",
     slug: "spiritual-intelligence",
     description: "Integrating timeless wisdom with modern leadership for unshakeable purpose.",
     logo: "/assets/frameworks/spiritual-intelligence.svg",
     url: "/frameworks/individual-intelligence/spiritual-intelligence",
     contentBlocks: [
       {
         type: 'hero',
         content: {
           title: "Spiritual Intelligence: The Source Code of Purpose",
           subtitle: "Integrating timeless wisdom with modern leadership to cultivate unshakeable purpose, vision, and resilience."
         }
       },
       {
         type: 'overview',
         content: {
           problem: "The most successful leaders often hit a wall not of competence, but of meaning. They achieve every external goal yet face burnout, strategic drift, and a growing sense of 'Is this all there is?'. This internal void inevitably projects outward, creating organizations that are efficient but lack soul, and teams that are compliant but not committed.",
           valueProp: "Spiritual Intelligence (SQ) is the ultimate meta-skill for navigating complexity and leading through ambiguity. It is the capacity to connect your daily actions to a deep and coherent sense of purpose, to find meaning in challenge, and to lead from a place of profound inner stability. It is the 'why' that fuels the 'what'.",
           roi: "While SQ may seem intangible, its impact is concrete. Leaders who operate from a clear and articulated purpose inspire teams with up to 60% higher engagement and 40% lower voluntary attrition. They are able to make values-aligned decisions under pressure, building a level of organizational trust that is a powerful, long-term competitive advantage."
         }
       },
       {
         type: 'components',
         content: {
           components: [
             { title: "Meaning Making", description: "The ability to interpret life's events, both successes and failures, through a lens of growth and purpose, creating a powerful and coherent personal narrative.", icon: "book-open" },
             { title: "Perspective Taking", description: "The capacity to transcend your own ego-centric view, holding a '10,000-foot perspective' to see the larger systems and interconnectedness at play.", icon: "mountain" },
             { title: "Values Integration", description: "The practice of achieving deep alignment between your stated values and your daily actions, creating a state of personal integrity that inspires profound trust.", icon: "shield-check" },
             { title: "Conscious Presence", description: "The skill of being fully present and aware in any given moment, allowing you to lead from a state of calm clarity rather than reactive anxiety.", icon: "eye" }
           ]
         }
       },
       {
         type: 'roadmap',
         content: {
           phases: [
             { title: "Phase 1: Clarifying Core Values", description: "An intensive discovery process to unearth your deepest, non-negotiable values that form the bedrock of your purpose." },
             { title: "Phase 2: Developing a Coherent Worldview", description: "We construct and pressure-test a personal leadership philosophy that allows you to make sense of the world in a consistent and meaningful way." },
             { title: "Phase 3: Integrating Purpose into Action", description: "We design concrete practices and rituals to ensure your newfound clarity is not just an idea, but a lived reality in your leadership and life." }
           ]
         }
       },
       {
         type: 'caseStudy',
         content: {
           clientName: "Founder & CEO, Social Impact Unicorn",
           challenge: "After a decade of relentless growth, the founder felt completely disconnected from the original mission that inspired the company. This personal burnout was beginning to infect the company culture, leading to strategic indecision and cynicism among the leadership team.",
           solution: "We engaged in a deep, 3-month Spiritual Intelligence integration. The process focused on reconnecting the founder's personal values (Values Integration) with the company's evolving place in the world (Perspective Taking), culminating in a newly articulated personal and corporate mission.",
           outcome: "The founder re-engaged with a profound sense of clarity and energy, which they translated into a new 10-year company vision. This vision re-ignited the team, unified the C-suite, and became the central pillar for their next successful round of funding."
         }
       },
       {
         type: 'methodology',
         content: {
           title: "A Secular, Evidence-Based Approach",
           content: "Our approach is pragmatic and non-sectarian. We synthesize the world's most robust developmental models—from the states of consciousness in **Integral Theory** to the cross-cultural wisdom traditions—into a practical framework for modern leaders. This is not about adopting a belief system; it is about building a more sophisticated internal guidance system."
         }
       },
       {
         type: 'cta',
         content: {
           headline: "Ready to Lead with Deeper Purpose?",
           buttonText: "Begin Your Integration",
           buttonLink: "/contact"
         }
       }
     ]
   },
   {
     name: "Leadership Intelligence",
     slug: "leadership-intelligence",
     description: "The art of systemic influence to orchestrate sustainable results.",
     logo: "/assets/frameworks/leadership-intelligence.svg",
     url: "/frameworks/individual-intelligence/leadership-intelligence",
     contentBlocks: [
       {
         type: 'hero',
         content: {
           title: "Leadership Intelligence: The Art of Systemic Influence",
           subtitle: "Moving beyond managing people to orchestrating the complex systems that drive sustainable results."
         }
       },
       {
         type: 'overview',
         content: {
           problem: "Many leaders are excellent managers. They can direct teams, execute plans, and solve contained problems. But they hit a hard ceiling when faced with systemic challenges—market shifts, cultural stagnation, or complex transformations. They try to manage the system's *parts*, failing to lead the *whole*.",
           valueProp: "Leadership Intelligence is the ultimate synthesis. It is the developed capacity to wield Emotional, Cognitive, and Spiritual Intelligence in concert to accurately read, diagnose, and influence the entire organizational ecosystem. It is the shift from being a player in the game to becoming the architect of the game itself.",
           roi: "Leaders operating with this integrated intelligence are the true force multipliers. They don't just lead teams; they create leadership cultures. Their initiatives have a 3x higher success rate in complex transformations, and they are consistently ranked in the top 5% for their ability to develop future leaders, creating a powerful and lasting organizational legacy."
         }
       },
       {
         type: 'components',
         content: {
           components: [
             { title: "Situational Awareness", description: "The capacity to accurately perceive the entire 'battlefield'—the culture, the politics, the market forces, and the hidden dynamics at play.", icon: "radar" },
             { title: "Vision & Intent", description: "The ability to synthesize complex data into a clear, compelling, and coherent vision that serves as the organization's 'North Star'.", icon: "compass" },
             { title: "Resource Orchestration", description: "The strategic wisdom to allocate capital, talent, and attention to the highest leverage points within the system for maximum impact.", icon: "cpu" },
             { title: "Culture Cultivation", description: "The skill of shaping the 'we' space—the shared values, behaviors, and beliefs that determine how work *actually* gets done.", icon: "users" }
           ]
         }
       },
       {
         type: 'roadmap',
         content: {
           phases: [
             { title: "Phase 1: Leadership Baseline Audit", description: "A 360-degree diagnostic to assess your current leadership style and its impact on the organizational system." },
             { title: "Phase 2: Systemic Skill Integration", description: "Targeted development in applying EQ, CQ, and SQ to real-world leadership challenges, moving from theory to practice." },
             { title: "Phase 3: Legacy Project", description: "You will lead a live, high-stakes strategic initiative, using your integrated intelligence to produce a measurable business outcome and solidify your capacity as a systemic leader." }
           ]
         }
       },
       {
         type: 'caseStudy',
         content: {
           clientName: "Newly Appointed CEO, Healthcare System",
           challenge: "A new CEO inherited a network of hospitals that were operationally sound but culturally siloed and strategically adrift. Attempts at system-wide initiatives were consistently blocked by infighting and a lack of shared vision.",
           solution: "We engaged the entire C-suite in a Leadership Intelligence program. The focus was on building a unified 'North Star' (Vision & Intent) and then empowering leaders to reshape their individual hospital cultures to align with it (Culture Cultivation).",
           outcome: "In 18 months, the organization achieved system-wide alignment on three key strategic priorities, resulting in a 20% increase in operational efficiency and a J.D. Power award for 'Most Improved Patient Satisfaction.' The CEO successfully transformed a collection of hospitals into a true healthcare *system*."
         }
       },
       {
         type: 'methodology',
         content: {
           title: "The Capstone Integration",
           content: "Leadership Intelligence is not taught; it is cultivated. Our methodology is the culmination of the 'Personal Mastery' journey. We use the **Integral Theory (AQAL)** framework as a master map to ensure that your capacities in the personal domains (**EQ, CQ, SQ**) are effectively translated into the systemic domains of action and impact. This is where personal mastery becomes organizational legacy."
         }
       },
       {
         type: 'cta',
         content: {
           headline: "Ready to Lead at a Systemic Level?",
           buttonText: "Define Your Legacy",
           buttonLink: "/contact"
         }
       }
     ]
   }
    ],
  },
];