export interface LandingPageConfig {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface LandingPageSection {
  id: string;
  type:
    | "hero"
    | "about"
    | "features"
    | "testimonials"
    | "gallery"
    | "contact"
    | "custom";
  title?: string;
  content?: string;
  order: number;
  visible: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config?: Record<string, any>;
}

export interface SocialLink {
  platform:
    | "twitter"
    | "facebook"
    | "instagram"
    | "linkedin"
    | "github"
    | "youtube"
    | "custom";
  url: string;
  label?: string;
  icon?: string;
}

export interface GeneratedFile {
  path: string;
  content: string;
}

export interface LandingPage {
  id: string;
  userId: string;
  repoIdentifier: string;
  repoUrl: string | null;
  customDomain: string | null;
  config:
    | (Record<string, unknown> & {
        generatedFiles?: GeneratedFile[];
      })
    | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateLandingPageInput = Omit<
  LandingPage,
  "id" | "createdAt" | "updatedAt"
>;

export type UpdateLandingPageInput = Partial<CreateLandingPageInput> & {
  id: string;
};
