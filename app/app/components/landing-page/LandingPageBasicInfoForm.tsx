import { Card } from "../Card";
import type { LandingPageConfigForm } from "../../types/landingPageConfig";

interface LandingPageBasicInfoFormProps {
  formData: LandingPageConfigForm;
  onInputChange: (field: keyof LandingPageConfigForm, value: unknown) => void;
}

export function LandingPageBasicInfoForm({
  formData,
  onInputChange,
}: LandingPageBasicInfoFormProps) {
  return (
    <Card>
      <h2 className="text-lg font-bold mb-4">Basic Information</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={e => onInputChange("title", e.target.value)}
            placeholder="Your Landing Page Title"
            className="w-full p-3 bg-background-dark border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Subtitle</label>
          <input
            type="text"
            value={formData.subtitle || ""}
            onChange={e => onInputChange("subtitle", e.target.value)}
            placeholder="A brief description"
            className="w-full p-3 bg-background-dark border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            AI Description
          </label>
          <p className="text-xs text-gray-400 mb-2">
            Describe your landing page vision for AI generation. This helps the
            AI understand what you want to create.
          </p>
          <textarea
            value={formData.aiDescription || ""}
            onChange={e => onInputChange("aiDescription", e.target.value)}
            placeholder="e.g., A modern landing page for a DeFi DEX with a hero section showcasing trading features, a features section highlighting low fees and fast transactions, and a call-to-action section..."
            className="w-full p-3 bg-background-dark border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary"
            rows={5}
          />
        </div>
      </div>
    </Card>
  );
}
