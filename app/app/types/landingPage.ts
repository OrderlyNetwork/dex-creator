export interface LandingPageConfig {
  [key: string]: any;
}

export interface LandingPageSection {
  id: string;
  type: 'hero' | 'about' | 'features' | 'testimonials' | 'gallery' | 'contact' | 'custom';
  title?: string;
  content?: string;
  order: number;
  visible: boolean;
  config?: Record<string, any>;
}

export interface SocialLink {
  platform: 'twitter' | 'facebook' | 'instagram' | 'linkedin' | 'github' | 'youtube' | 'custom';
  url: string;
  label?: string;
  icon?: string;
}

export interface LandingPage {
  id: string;
  userId: string;
  repoIdentifier: string;
  repoUrl: string | null;
  customDomain: string | null;
  htmlContent: string | null;
  config: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateLandingPageInput = Omit<LandingPage, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateLandingPageInput = Partial<CreateLandingPageInput> & {
  id: string;
};