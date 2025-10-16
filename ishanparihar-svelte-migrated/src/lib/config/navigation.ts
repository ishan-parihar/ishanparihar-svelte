// Navigation structure for the site
// This is the single source of truth for all navigation items across desktop and mobile views

export interface NavigationItem {
  name: string;
  path: string;
  hasDropdown?: boolean;
  dropdownItems?: Array<{
    name: string;
    path: string;
    description: string;
  }>;
}

export const navigationItems: NavigationItem[] = [
  { name: "Home", path: "/" },
  {
    name: "About",
    path: "/about",
    hasDropdown: true,
    dropdownItems: [
      { name: "About Us", path: "/about", description: "Our story, mission, and founder" },
      { name: "Framework", path: "/framework", description: "Our methodology and approach" },
      { name: "Offerings", path: "/offerings", description: "Services and solutions" },
    ],
  },
  {
    name: "Frameworks",
    path: "/frameworks",
    hasDropdown: true,
    dropdownItems: [
      { name: "Individual Intelligence", path: "/frameworks/individual-intelligence", description: "Mastering the inner world for personal and cognitive agility." },
      { name: "Team & Relationship Intelligence", path: "/frameworks/team-intelligence", description: "Fostering synergy and building high-trust, effective teams." },
      { name: "Organizational Systems", path: "/frameworks/organizational-systems", description: "Designing resilient systems for sustainable growth and change." },
      { name: "Cultural & Values Intelligence", path: "/frameworks/cultural-intelligence", description: "Mapping cultural DNA to lead through complex value systems." },
    ],
  },
  { name: "Blog", path: "/blog" },
  { name: "Assessments", path: "/assessments" },
];