// Enable Incremental Static Regeneration (ISR) with 30-minute revalidation
export const revalidate = 1800; // Revalidate every 30 minutes

import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";
import { createServiceRoleClient } from "@/utils/supabase/server";
import { Metadata } from "next";
import { ProjectsPageClient } from "@/components/projects/ProjectsPageClient";

export const metadata: Metadata = {
  title: "Projects | Ishan Parihar",
  description:
    "Explore my portfolio of projects showcasing innovative solutions and creative implementations.",
};

// Define the Project type based on the database structure
export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  excerpt?: string;
  cover_image_url?: string;
  source_url?: string;
  live_url?: string;
  tags?: string[];
  is_featured?: boolean;
  status: string;
  priority: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  concepts?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

// Fetch public projects function
async function getPublicProjects(): Promise<Project[]> {
  try {
    const supabase = createServiceRoleClient();

    const { data: projects, error } = await supabase
      .from("projects")
      .select(
        `
        *,
        project_concepts(
          concept_id,
          concepts(id, name, slug)
        )
      `,
      )
      .eq("is_featured", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[ProjectsPage] Error fetching projects:", error);
      return [];
    }

    // Transform the data to include concepts array
    const projectsWithConcepts = projects.map((project: any) => ({
      ...project,
      concepts: project.project_concepts?.map((pc: any) => pc.concepts) || [],
    }));

    return projectsWithConcepts;
  } catch (error) {
    console.error("[ProjectsPage] Critical error during data fetching:", error);
    return [];
  }
}

export default async function ProjectsPage() {
  const queryClient = new QueryClient();

  try {
    // Fetch projects data
    const projects = await getPublicProjects();

    // Populate the query client with the fetched data
    queryClient.setQueryData(["public-projects"], projects);
  } catch (error) {
    console.error("[ProjectsPage] Critical error during data fetching:", error);
  }

  // Extract data from the query client for initial props
  const projectsData = queryClient.getQueryData<Project[]>(["public-projects"]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProjectsPageClient initialProjects={projectsData || []} />
    </HydrationBoundary>
  );
}
