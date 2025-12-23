/**
 * Converts a hex color string to space-separated RGB format
 * @param hex - Hex color string (with or without #)
 * @returns Space-separated RGB string (e.g., "255 128 64")
 */
export function hexToRgbSpaceSeparated(hex: string): string {
  hex = hex.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
}

/**
 * Converts a space-separated RGB string to hex color format
 * @param rgb - Space-separated RGB string (e.g., "255 128 64")
 * @returns Hex color string (e.g., "#ff8040")
 */
export function rgbSpaceSeparatedToHex(rgb: string): string {
  const parts = rgb.trim().split(/\s+/);
  if (parts.length === 3) {
    const r = parseInt(parts[0], 10);
    const g = parseInt(parts[1], 10);
    const b = parseInt(parts[2], 10);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }
  return "";
}
