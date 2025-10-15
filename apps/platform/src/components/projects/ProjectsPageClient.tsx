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
import { ExternalLink, Github, Calendar, Tag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  AnimatedSection,
  StaggeredList,
  InteractiveCard,
} from "@/components/motion";
import { Project } from "@/app/projects/page";

interface ProjectsPageClientProps {
  initialProjects: Project[];
}

export function ProjectsPageClient({
  initialProjects,
}: ProjectsPageClientProps) {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="max-w-4xl mx-auto text-center">
          <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6">
            Featured Projects
          </h1>
          <p className="font-sans text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            A showcase of innovative solutions, creative implementations, and
            technical excellence.
          </p>
          <div className="mt-8 h-1 w-24 bg-gradient-to-r from-accent-consciousness to-accent-quantum mx-auto rounded-full"></div>
        </AnimatedSection>
      </section>

      {/* Projects Grid Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {initialProjects && initialProjects.length > 0 ? (
            <StaggeredList
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
              staggerDelay={0.15}
            >
              {initialProjects.map((project) => (
                <InteractiveCard key={project.id}>
                  <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-accent-consciousness/30 h-full">
                    {/* Project Image */}
                    {project.cover_image_url && (
                      <div className="relative aspect-video overflow-hidden rounded-t-lg">
                        <Image
                          src={project.cover_image_url}
                          alt={project.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    )}

                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle className="font-display text-xl text-foreground group-hover:text-accent-consciousness transition-colors">
                          {project.title}
                        </CardTitle>
                        {project.is_featured && (
                          <Badge variant="secondary" className="ml-2">
                            Featured
                          </Badge>
                        )}
                      </div>
                      {project.excerpt && (
                        <CardDescription className="font-sans text-sm leading-relaxed text-muted-foreground">
                          {project.excerpt}
                        </CardDescription>
                      )}
                    </CardHeader>

                    <CardContent className="pt-0">
                      {/* Tags */}
                      {project.tags && project.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.tags.slice(0, 3).map((tag, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              <Tag className="w-3 h-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                          {project.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{project.tags.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Project Date */}
                      {project.created_at && (
                        <div className="flex items-center text-xs text-muted-foreground mb-4">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(project.created_at).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                            },
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-auto">
                        <Button asChild size="sm" className="flex-1">
                          <Link href={`/projects/${project.slug}`}>
                            View Details
                          </Link>
                        </Button>

                        {project.live_url && (
                          <Button asChild variant="outline" size="sm">
                            <Link
                              href={project.live_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          </Button>
                        )}

                        {project.source_url && (
                          <Button asChild variant="outline" size="sm">
                            <Link
                              href={project.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Github className="w-4 h-4" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </InteractiveCard>
              ))}
            </StaggeredList>
          ) : (
            <AnimatedSection className="text-center py-20">
              <div className="max-w-md mx-auto">
                <h3 className="text-xl font-semibold mb-3 text-foreground">
                  No Projects Yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  Featured projects will appear here once they are published.
                </p>
                <Button asChild variant="outline">
                  <Link href="/blog">Explore Blog Instead</Link>
                </Button>
              </div>
            </AnimatedSection>
          )}
        </div>
      </section>
    </main>
  );
}
