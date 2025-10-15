/**
 * Main tRPC Router
 * This file combines all individual routers into the main app router
 */

import { createTRPCRouter } from "@/lib/trpc";
import { authRouter } from "./routers/auth";
import { blogRouter } from "./routers/blog";
import { userRouter } from "./routers/user";
import { adminRouter } from "./routers/admin";
import { servicesRouter } from "./routers/services";
import { paymentsRouter } from "./routers/payments";
import { supportRouter } from "./routers/support";
import { filesRouter } from "./routers/files";
import { newsletterRouter } from "./routers/newsletter";
import { communicationsRouter } from "./routers/communications";
import { assessmentRouter } from "./routers/assessment";
import { assessmentsRouter } from "./routers/assessments";
import { assessmentQuestionsRouter } from "./routers/assessment-questions";
import { assessmentOptionsRouter } from "./routers/assessment-options";
import { conceptsRouter } from "./routers/concepts";
import { projectsRouter } from "./routers/projects";
import { serviceCategoriesRouter } from "./routers/service-categories";
import { analyticsRouter } from "./routers/analytics";

/**
 * This is the primary router for your server.
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  blog: blogRouter,
  user: userRouter,
  admin: adminRouter,
  services: servicesRouter,
  payments: paymentsRouter,
  support: supportRouter,
  files: filesRouter,
  newsletter: newsletterRouter,
  communications: communicationsRouter,
  assessment: assessmentRouter,
  assessments: assessmentsRouter,
  assessmentQuestions: assessmentQuestionsRouter,
  assessmentOptions: assessmentOptionsRouter,
  concepts: conceptsRouter,
  projects: projectsRouter,
  serviceCategories: serviceCategoriesRouter,
  analytics: analyticsRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
