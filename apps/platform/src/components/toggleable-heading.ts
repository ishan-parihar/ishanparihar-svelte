/**
 * Utility functions for toggling heading visibility in blog posts
 */

/**
 * Toggle all headings in the document
 * @param expanded Whether to expand or collapse all headings
 */
export function toggleAllHeadings(expanded: boolean): void {
  // Find all toggleable heading containers
  const headingContainers = document.querySelectorAll(
    ".toggleable-heading-container",
  );

  headingContainers.forEach((container) => {
    // Find the content element
    const content = container.querySelector(".toggleable-content");
    if (content) {
      // Set the expanded state
      if (expanded) {
        content.classList.remove("hidden");
        container.setAttribute("data-expanded", "true");
      } else {
        content.classList.add("hidden");
        container.setAttribute("data-expanded", "false");
      }
    }
  });
}

/**
 * Toggle headings by level
 * @param level The heading level (1-6)
 * @param expanded Whether to expand or collapse the headings
 */
export function toggleHeadingsByLevel(level: number, expanded: boolean): void {
  // Validate level
  if (level < 1 || level > 6) {
    console.error(`Invalid heading level: ${level}. Must be between 1 and 6.`);
    return;
  }

  // Find all toggleable heading containers for this level
  const headingContainers = document.querySelectorAll(
    `.toggleable-heading-container[data-heading-level="${level}"]`,
  );

  headingContainers.forEach((container) => {
    // Find the content element
    const content = container.querySelector(".toggleable-content");
    if (content) {
      // Set the expanded state
      if (expanded) {
        content.classList.remove("hidden");
        container.setAttribute("data-expanded", "true");
      } else {
        content.classList.add("hidden");
        container.setAttribute("data-expanded", "false");
      }
    }
  });
}
