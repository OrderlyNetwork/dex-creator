import { Card } from "../Card";
import { Button } from "../Button";
import ImagePaste from "../ImagePaste";

interface LandingPageBrandingFormProps {
  primaryLogo: Blob | null;
  secondaryLogo: Blob | null;
  banner: Blob | null;
  onPrimaryLogoChange: (blob: Blob | null) => void;
  onSecondaryLogoChange: (blob: Blob | null) => void;
  onBannerChange: (blob: Blob | null) => void;
  showResetButton?: boolean;
  onReset?: () => void;
}

export function LandingPageBrandingForm({
  primaryLogo,
  secondaryLogo,
  banner,
  onPrimaryLogoChange,
  onSecondaryLogoChange,
  onBannerChange,
  showResetButton,
  onReset,
}: LandingPageBrandingFormProps) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Branding</h2>
        {showResetButton && onReset && (
          <Button type="button" variant="secondary" size="sm" onClick={onReset}>
            <div className="i-mdi:refresh h-4 w-4 mr-2"></div>
            Reset
          </Button>
        )}
      </div>
      <div className="space-y-4">
        <div>
          <ImagePaste
            id="landingPagePrimaryLogo"
            label={
              <>
                Primary Logo{" "}
                <span className="text-gray-400 text-sm font-normal">
                  (optional)
                </span>
              </>
            }
            value={primaryLogo || undefined}
            onChange={onPrimaryLogoChange}
            imageType="primaryLogo"
            helpText="Main logo for your landing page. Recommended: 400x400px or larger."
          />
        </div>
        <div>
          <ImagePaste
            id="landingPageSecondaryLogo"
            label={
              <>
                Secondary Logo{" "}
                <span className="text-gray-400 text-sm font-normal">
                  (optional)
                </span>
              </>
            }
            value={secondaryLogo || undefined}
            onChange={onSecondaryLogoChange}
            imageType="secondaryLogo"
            helpText="Secondary logo for footer and other areas. Recommended: 200x200px or larger."
          />
        </div>
        <div>
          <ImagePaste
            id="landingPageBanner"
            label={
              <>
                Banner Image{" "}
                <span className="text-gray-400 text-sm font-normal">
                  (optional)
                </span>
              </>
            }
            value={banner || undefined}
            onChange={onBannerChange}
            imageType="banner"
            helpText="Large banner image for hero section. Recommended: 1200x400px or larger."
          />
        </div>
      </div>
    </Card>
  );
}
