// Enable Incremental Static Regeneration (ISR) with 30-minute revalidation
export const revalidate = 1800; // Revalidate every 30 minutes

import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";
import { createServiceRoleClient } from "@/utils/supabase/server";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetailClient } from "@/components/projects/ProjectDetailClient";
import { Project } from "@/app/projects/page";

interface ProjectPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Fetch single project by slug
async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
    const supabase = createServiceRoleClient();

    const { data: project, error } = await supabase
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
      .eq("slug", slug)
      .eq("is_featured", true) // Only show featured projects publicly
      .single();

    if (error) {
      console.error("[ProjectDetailPage] Error fetching project:", error);
      return null;
    }

    // Transform the data to include concepts array
    const projectWithConcepts = {
      ...project,
      concepts: project.project_concepts?.map((pc: any) => pc.concepts) || [],
    };

    return projectWithConcepts;
  } catch (error) {
    console.error(
      "[ProjectDetailPage] Critical error during data fetching:",
      error,
    );
    return null;
  }
}

// Generate metadata for the project page
export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return {
      title: "Project Not Found | Ishan Parihar",
      description: "The requested project could not be found.",
    };
  }

  return {
    title: `${project.title} | Ishan Parihar`,
    description:
      project.excerpt ||
      project.description ||
      `Learn more about ${project.title}`,
    openGraph: {
      title: project.title,
      description: project.excerpt || project.description,
      images: project.cover_image_url ? [project.cover_image_url] : [],
    },
  };
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const queryClient = new QueryClient();

  try {
    // Fetch project data
    const project = await getProjectBySlug(slug);

    if (!project) {
      notFound();
    }

    // Populate the query client with the fetched data
    queryClient.setQueryData(["project", slug], project);
  } catch (error) {
    console.error(
      "[ProjectDetailPage] Critical error during data fetching:",
      error,
    );
    notFound();
  }

  // Extract data from the query client for initial props
  const projectData = queryClient.getQueryData<Project>(["project", slug]);

  if (!projectData) {
    notFound();
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProjectDetailClient project={projectData} />
    </HydrationBoundary>
  );
}
