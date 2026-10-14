import { site, navigation } from "@/content/site";
import { projects, type Project } from "@/content/projects";
import { getPublishableProofs } from "@/content/proofs";

/** Projetos que podem ir ao ar de acordo com `site.showPlaceholders`. */
export const visibleProjects: Project[] = projects.filter(
  (p) => site.showPlaceholders || p.status !== "em-documentacao",
);

export const publishableProofs = getPublishableProofs();

export const showProjects = visibleProjects.length > 0;
export const showProofs = publishableProofs.length > 0 || site.showPlaceholders;

/** Menu sem links quebrados: remove âncoras de seções ocultas. */
export const visibleNavigation = navigation.filter(
  (item) => item.href !== "#projetos" || showProjects,
);

export function projectTitle(p: Project): string {
  return p.disclosure.clientNameAuthorized ? p.clientName : p.anonymousTitle;
}
