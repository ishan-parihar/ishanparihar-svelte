"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Github, Calendar, Tag, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  AnimatedSection,
  StaggeredList,
  InteractiveCard,
} from "@/components/motion";
import { Project } from "@/app/projects/page";

interface ProjectDetailClientProps {
  project: Project;
}

export function ProjectDetailClient({ project }: ProjectDetailClientProps) {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section with Project Image */}
      <section className="relative">
        {project.cover_image_url && (
          <div className="relative aspect-[3/1] w-full overflow-hidden">
            <Image
              src={project.cover_image_url}
              alt={project.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
          </div>
        )}

        {/* Back Button */}
        <div className="absolute top-8 left-8 z-10">
          <Button asChild variant="secondary" size="sm">
            <Link href="/projects">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Link>
          </Button>
        </div>
      </section>

      {/* Project Content */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            {/* Project Header */}
            <div className="mb-8">
              <div className="flex items-start justify-between mb-4">
                <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">
                  {project.title}
                </h1>
                {project.is_featured && (
                  <Badge variant="secondary" className="ml-4">
                    Featured
                  </Badge>
                )}
              </div>

              {project.excerpt && (
                <p className="font-sans text-xl text-muted-foreground leading-relaxed mb-6">
                  {project.excerpt}
                </p>
              )}

              {/* Project Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                {project.created_at && (
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(project.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                )}

                {project.status && (
                  <Badge variant="outline">{project.status}</Badge>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {project.live_url && (
                  <Button asChild>
                    <Link
                      href={project.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Live
                    </Link>
                  </Button>
                )}

                {project.source_url && (
                  <Button asChild variant="outline">
                    <Link
                      href={project.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="w-4 h-4 mr-2" />
                      View Source
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </AnimatedSection>

          {/* Project Details Grid */}
          <StaggeredList
            className="grid md:grid-cols-2 gap-8 mb-12"
            staggerDelay={0.2}
          >
            {/* Description Card */}
            <InteractiveCard>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="font-display text-xl">
                    About This Project
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="font-sans leading-relaxed">
                    {project.description ||
                      "No detailed description available for this project."}
                  </CardDescription>
                </CardContent>
              </Card>
            </InteractiveCard>

            {/* Technologies & Tags Card */}
            <InteractiveCard>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="font-display text-xl">
                    Technologies Used
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {project.tags && project.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No technologies specified.
                    </p>
                  )}
                </CardContent>
              </Card>
            </InteractiveCard>
          </StaggeredList>

          {/* Concepts Section */}
          {project.concepts && project.concepts.length > 0 && (
            <AnimatedSection delay={0.4}>
              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-xl">
                    Related Concepts
                  </CardTitle>
                  <CardDescription>
                    Key concepts and frameworks explored in this project
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {project.concepts.map((concept) => (
                      <Badge key={concept.id} variant="outline">
                        {concept.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>
          )}
        </div>
      </section>
    </main>
  );
}
