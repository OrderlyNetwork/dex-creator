import { FC, useState, useEffect } from "react";
import { Button } from "./Button";
import FormInput from "./FormInput";
import { Card } from "./Card";

export interface AIThemeGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  isGeneratingTheme: boolean;
  onGenerateTheme: (prompt: string) => void;
}

const AIThemeGeneratorModal: FC<AIThemeGeneratorModalProps> = ({
  isOpen,
  onClose,
  isGeneratingTheme: externalIsGeneratingTheme,
  onGenerateTheme,
}) => {
  const [themePrompt, setThemePrompt] = useState("");
  const [localIsGenerating, setLocalIsGenerating] = useState(false);

  const isGeneratingTheme = localIsGenerating || externalIsGeneratingTheme;

  useEffect(() => {
    if (!isOpen) {
      setThemePrompt("");
      setLocalIsGenerating(false);
    }
  }, [isOpen]);

  useEffect(() => {
    setLocalIsGenerating(externalIsGeneratingTheme);
  }, [externalIsGeneratingTheme]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] bg-background-dark/95 flex items-center justify-center p-4"
      onClick={e => e.stopPropagation()}
      onKeyDown={e => e.stopPropagation()}
      onKeyUp={e => e.stopPropagation()}
      role="dialog"
      data-higher-modal="true"
    >
      <div className="bg-background-card border border-light/20 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-light/10">
          <h2 className="text-lg font-bold text-gray-200">
            AI Theme Generator
          </h2>
          <Button onClick={onClose} variant="secondary" size="sm" type="button">
            Close
          </Button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <div className="flex flex-col gap-4">
            <p className="text-xs text-gray-400">
              Describe how you want your DEX theme to look and our AI will
              generate it for you.
            </p>
            <Card className="p-3" variant="default">
              <div className="flex items-start gap-2">
                <div className="i-mdi:information-outline text-primary-light h-4 w-4 mt-0.5 flex-shrink-0"></div>
                <div>
                  <p className="text-xs text-gray-300 mb-1">
                    <span className="text-primary-light font-medium">
                      Note:
                    </span>{" "}
                    AI-generated themes are a starting point and may not be
                    perfect. After generating:
                  </p>
                  <ul className="text-xs text-gray-300 list-disc pl-4 space-y-0.5">
                    <li>Review the theme in the preview modal</li>
                    <li>Make adjustments to colors as needed</li>
                  </ul>
                </div>
              </div>
            </Card>
            <FormInput
              id="themePrompt"
              label="Theme Description"
              value={themePrompt}
              onChange={e => setThemePrompt(e.target.value)}
              placeholder="e.g., A dark blue theme with neon green accents"
              helpText="Describe your desired color scheme and style"
              maxLength={100}
              disabled={isGeneratingTheme}
            />
          </div>
        </div>
        <div className="flex items-center justify-end p-4 border-t border-light/10">
          <Button
            onClick={() => {
              if (!themePrompt.trim() || isGeneratingTheme) {
                return;
              }
              setLocalIsGenerating(true);
              onGenerateTheme(themePrompt);
            }}
            isLoading={isGeneratingTheme}
            loadingText="Generating..."
            disabled={isGeneratingTheme}
            variant="primary"
            size="sm"
            type="button"
          >
            <span className="flex items-center gap-1">
              <div className="i-mdi:magic-wand h-4 w-4"></div>Generate Theme
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIThemeGeneratorModal;
