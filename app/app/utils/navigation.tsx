import { HTMLAttributeAnchorTarget } from "react";

/**
 * Check if the given path is the currently active path
 * @param currentPath Current route path
 * @param targetPath Target path
 * @param target Target attribute of the link
 */
export function isPathActive(
  currentPath: string,
  targetPath: string,
  target: HTMLAttributeAnchorTarget | undefined
): boolean {
  // External links are not active
  if (target === "_blank") return false;

  // Exact match for home page
  if (targetPath === "/" && currentPath === "/") return true;

  // Other paths use prefix matching
  if (targetPath !== "/" && currentPath.startsWith(targetPath)) return true;

  return false;
}

/**
 * Get the complete path with query parameters
 */
export function getPathWithSearch(path: string, search: string): string {
  // External links do not add query parameters
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `${path}${search}`;
}
