import type { GeneratedFile } from "../types/landingPage";
import type { TeamMember } from "../components/EditableTeamList";

/**
 * Migrate old string[] team members format to TeamMember[] format
 */
export function migrateTeamMembers(
  teamMembers: unknown
): TeamMember[] | undefined {
  if (!teamMembers) return undefined;
  if (Array.isArray(teamMembers)) {
    if (
      teamMembers.length > 0 &&
      typeof teamMembers[0] === "object" &&
      "name" in teamMembers[0]
    ) {
      return teamMembers as TeamMember[];
    }
    if (teamMembers.length > 0 && typeof teamMembers[0] === "string") {
      return (teamMembers as string[]).map(name => ({
        name,
        description: "",
        links: [],
      }));
    }
  }
  return undefined;
}

/**
 * Combine generated files into a previewable HTML document with image injection
 */
export function combineGeneratedFilesToHtml(
  generatedFiles: GeneratedFile[],
  config?: Record<string, unknown> | null,
  teamMemberImageDataUrls?: (string | null)[],
  brandingImageUrls?: {
    primaryLogo?: string | null;
    secondaryLogo?: string | null;
    banner?: string | null;
  }
): string | null {
  if (!generatedFiles || generatedFiles.length === 0) {
    return null;
  }

  const indexHtml = generatedFiles.find(f => f.path === "index.html");
  if (!indexHtml) {
    return null;
  }

  let html = indexHtml.content;

  if (config) {
    const imageMap: Record<string, string> = {
      "assets/primaryLogo.webp": "primaryLogoData",
      "assets/secondaryLogo.webp": "secondaryLogoData",
      "assets/banner.webp": "bannerData",
      "./assets/primaryLogo.webp": "primaryLogoData",
      "./assets/secondaryLogo.webp": "secondaryLogoData",
      "./assets/banner.webp": "bannerData",
    };

    Object.entries(imageMap).forEach(([imagePath, configKey]) => {
      const imageData = config[configKey];
      if (imageData && typeof imageData === "string") {
        const dataUrl = imageData.startsWith("data:")
          ? imageData
          : `data:image/webp;base64,${imageData}`;

        html = html.replace(
          new RegExp(
            `src=["']${imagePath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`,
            "gi"
          ),
          `src="${dataUrl}"`
        );

        html = html.replace(
          new RegExp(
            `url\\(["']?${imagePath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']?\\)`,
            "gi"
          ),
          `url('${dataUrl}')`
        );
      }
    });

    const teamMembers = config.teamMembers as
      | Array<{ imageData?: string }>
      | undefined;
    if (teamMembers && Array.isArray(teamMembers)) {
      teamMembers.forEach((member, index) => {
        if (member.imageData && typeof member.imageData === "string") {
          const imagePath = `assets/team/member${index + 1}.webp`;
          const dataUrl = member.imageData.startsWith("data:")
            ? member.imageData
            : `data:image/webp;base64,${member.imageData}`;

          html = html.split(`src="${imagePath}"`).join(`src="${dataUrl}"`);
          html = html.split(`src='${imagePath}'`).join(`src="${dataUrl}"`);
          html = html.split(`src="./${imagePath}"`).join(`src="${dataUrl}"`);
          html = html.split(`src='./${imagePath}'`).join(`src="${dataUrl}"`);

          html = html.split(`'${imagePath}'`).join(`'${dataUrl}'`);
          html = html.split(`"${imagePath}"`).join(`"${dataUrl}"`);
        }
      });
    }
  }

  if (teamMemberImageDataUrls && teamMemberImageDataUrls.length > 0) {
    teamMemberImageDataUrls.forEach((dataUrl, index) => {
      if (dataUrl) {
        const imagePath = `assets/team/member${index + 1}.webp`;

        html = html.split(`src="${imagePath}"`).join(`src="${dataUrl}"`);
        html = html.split(`src='${imagePath}'`).join(`src="${dataUrl}"`);
        html = html.split(`src="./${imagePath}"`).join(`src="${dataUrl}"`);
        html = html.split(`src='./${imagePath}'`).join(`src="${dataUrl}"`);

        html = html.split(`'${imagePath}'`).join(`'${dataUrl}'`);
        html = html.split(`"${imagePath}"`).join(`"${dataUrl}"`);
      }
    });
  }

  if (brandingImageUrls) {
    const brandingMap: Record<string, string | null | undefined> = {
      "assets/primaryLogo.webp": brandingImageUrls.primaryLogo,
      "assets/secondaryLogo.webp": brandingImageUrls.secondaryLogo,
      "assets/banner.webp": brandingImageUrls.banner,
      "./assets/primaryLogo.webp": brandingImageUrls.primaryLogo,
      "./assets/secondaryLogo.webp": brandingImageUrls.secondaryLogo,
      "./assets/banner.webp": brandingImageUrls.banner,
    };

    Object.entries(brandingMap).forEach(([imagePath, dataUrl]) => {
      if (dataUrl) {
        html = html.replace(
          new RegExp(
            `src=["']${imagePath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`,
            "gi"
          ),
          `src="${dataUrl}"`
        );

        html = html.replace(
          new RegExp(
            `url\\(["']?${imagePath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']?\\)`,
            "gi"
          ),
          `url('${dataUrl}')`
        );
      }
    });
  }

  return html;
}

/**
 * Convert a base64 data URL to a Blob
 */
export async function base64ToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl);
  return response.blob();
}

/**
 * Convert a Blob to a base64 data URL
 */
export function blobToDataUrl(blob: Blob | null): Promise<string | null> {
  if (!blob) return Promise.resolve(null);
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(blob);
  });
}
