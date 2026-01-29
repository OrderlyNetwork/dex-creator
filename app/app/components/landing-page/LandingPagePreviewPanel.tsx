import { Card } from "../Card";

interface LandingPagePreviewPanelProps {
  previewHtml: string | null;
}

export function LandingPagePreviewPanel({
  previewHtml,
}: LandingPagePreviewPanelProps) {
  return (
    <Card>
      <h2 className="text-lg font-bold mb-4">Preview</h2>
      <div className="border border-gray-700 rounded-lg overflow-hidden">
        {previewHtml ? (
          <iframe
            srcDoc={previewHtml}
            className="w-full h-[600px] border-0"
            title="Landing Page Preview"
          />
        ) : (
          <div className="w-full h-[600px] flex items-center justify-center bg-background-dark text-gray-400">
            <div className="text-center">
              <div className="i-mdi:eye-off h-12 w-12 mx-auto mb-4"></div>
              <p>No preview available</p>
              <p className="text-sm mt-2">
                Save configuration and generate content to see preview
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
