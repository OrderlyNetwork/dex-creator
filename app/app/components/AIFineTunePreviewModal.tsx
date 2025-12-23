import { FC, useState, useEffect, useRef } from "react";
import { Button } from "./Button";
import DexPreview, { DexPreviewProps } from "./DexPreview";

export interface AIFineTunePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (overrides: string) => void;
  onReject: () => void;
  oldTheme: string | null;
  newOverrides: string[];
  previewProps: DexPreviewProps;
  viewMode?: "desktop" | "mobile";
}

const AIFineTunePreviewModal: FC<AIFineTunePreviewModalProps> = ({
  isOpen,
  onClose,
  onApply,
  onReject,
  oldTheme,
  newOverrides,
  previewProps,
  viewMode = "desktop",
}) => {
  const [selectedVariant, setSelectedVariant] = useState<"old" | 0 | 1 | 2>(0);
  const originalMatchMediaRef = useRef<typeof window.matchMedia | null>(null);

  useEffect(() => {
    if (viewMode === "mobile" && isOpen) {
      const originalMatchMedia = window.matchMedia.bind(window);
      originalMatchMediaRef.current = originalMatchMedia;
      window.matchMedia = (query: string) => {
        if (query === "(max-width: 768px)") {
          return {
            matches: true,
            media: query,
            onchange: null,
            addListener: () => {},
            removeListener: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => true,
          } as MediaQueryList;
        }
        return originalMatchMedia(query);
      };
    } else if (originalMatchMediaRef.current) {
      window.matchMedia = originalMatchMediaRef.current;
      originalMatchMediaRef.current = null;
    }

    return () => {
      if (originalMatchMediaRef.current) {
        window.matchMedia = originalMatchMediaRef.current;
        originalMatchMediaRef.current = null;
      }
    };
  }, [viewMode, isOpen]);

  if (!isOpen) return null;

  const getCurrentTheme = () => {
    if (selectedVariant === "old") {
      return oldTheme || "";
    }
    const selectedOverrides = newOverrides[selectedVariant];
    return oldTheme
      ? `${oldTheme}\n\n/* AI Fine-Tune Overrides */\n${selectedOverrides}`
      : `/* AI Fine-Tune Overrides */\n${selectedOverrides}`;
  };

  const currentTheme = getCurrentTheme();

  const handleApply = () => {
    if (selectedVariant === "old") {
      onReject();
      onClose();
      return;
    }
    onApply(newOverrides[selectedVariant]);
    onClose();
  };

  const handleReject = () => {
    onReject();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[10000] bg-background-dark/95 flex flex-col"
      onClick={e => e.stopPropagation()}
      onKeyDown={e => e.stopPropagation()}
      onKeyUp={e => e.stopPropagation()}
      role="dialog"
      data-higher-modal="true"
    >
      <div className="flex items-center justify-between p-4 border-b border-light/10">
        <h2 className="text-lg font-bold text-gray-200">
          Preview Fine-Tune Changes
        </h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-background-card border border-light/20 rounded-lg p-1">
            <button
              onClick={() => setSelectedVariant("old")}
              className={`px-3 py-1.5 text-sm rounded transition-colors ${
                selectedVariant === "old"
                  ? "bg-primary text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
              type="button"
            >
              Old
            </button>
            {[0, 1, 2].map(index => (
              <button
                key={index}
                onClick={() => setSelectedVariant(index as 0 | 1 | 2)}
                className={`px-3 py-1.5 text-sm rounded transition-colors ${
                  selectedVariant === index
                    ? "bg-primary text-white"
                    : "text-gray-400 hover:text-gray-200"
                }`}
                type="button"
              >
                {index + 1}
              </button>
            ))}
          </div>
          <Button
            onClick={handleReject}
            variant="ghost"
            size="md"
            type="button"
          >
            Reject
          </Button>
          <Button
            onClick={handleApply}
            variant="primary"
            size="md"
            type="button"
            disabled={selectedVariant === "old"}
          >
            {selectedVariant === "old" ? "Select a Variant" : "Accept Changes"}
          </Button>
        </div>
      </div>

      <div
        className={`flex-1 relative min-h-0 ${
          viewMode === "mobile"
            ? "overflow-y-auto overflow-x-hidden"
            : "overflow-hidden"
        }`}
      >
        <div
          data-preview-container
          className={`${
            viewMode === "mobile" ? "max-w-md mx-auto py-4" : "h-full"
          } w-full`}
        >
          <DexPreview
            {...previewProps}
            customStyles={currentTheme}
            className={viewMode === "mobile" ? "w-full" : "h-full w-full"}
          />
        </div>
      </div>
    </div>
  );
};

export default AIFineTunePreviewModal;
