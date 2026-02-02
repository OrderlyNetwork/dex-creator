import { Card } from "../Card";
import type { LandingPageConfigForm } from "../../types/landingPageConfig";

interface LandingPageMetadataFormProps {
  formData: LandingPageConfigForm;
  onInputChange: (field: keyof LandingPageConfigForm, value: unknown) => void;
}

export function LandingPageMetadataForm({
  formData,
  onInputChange,
}: LandingPageMetadataFormProps) {
  return (
    <Card>
      <h2 className="text-lg font-bold mb-4">SEO & Metadata</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Meta Description
          </label>
          <p className="text-xs text-gray-400 mb-2">
            A brief description of your landing page for search engines (150-160
            characters recommended). If left empty, the AI will generate one.
          </p>
          <textarea
            value={formData.metadata?.description || ""}
            onChange={e =>
              onInputChange("metadata", {
                ...formData.metadata,
                description: e.target.value,
              })
            }
            placeholder="e.g., Trade cryptocurrencies with zero fees on our advanced DEX platform..."
            maxLength={300}
            className="w-full p-3 bg-background-dark border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary"
            rows={3}
          />
          <p className="text-xs text-gray-400 mt-1">
            {(formData.metadata?.description || "").length}/300 characters
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Meta Keywords
          </label>
          <p className="text-xs text-gray-400 mb-2">
            Comma-separated keywords for SEO (e.g., "DEX, trading,
            cryptocurrency, DeFi").
          </p>
          <input
            type="text"
            value={(formData.metadata?.keywords || []).join(", ")}
            onChange={e => {
              const keywords = e.target.value
                .split(",")
                .map(k => k.trim())
                .filter(k => k.length > 0);
              onInputChange("metadata", {
                ...formData.metadata,
                keywords,
              });
            }}
            placeholder="DEX, trading, cryptocurrency, DeFi, blockchain"
            className="w-full p-3 bg-background-dark border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary"
          />
          <p className="text-xs text-gray-400 mt-1">
            {(formData.metadata?.keywords || []).length} keyword(s) added
          </p>
        </div>
      </div>
    </Card>
  );
}
