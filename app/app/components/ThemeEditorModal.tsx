import { FC, useState, ChangeEvent, useEffect } from "react";
import { Button } from "./Button";

export interface ThemeEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: string | null;
  defaultTheme: string;
  savedTheme: string | null;
  onThemeChange: (newTheme: string) => void;
}

const ThemeEditorModal: FC<ThemeEditorModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  defaultTheme,
  savedTheme,
  onThemeChange,
}) => {
  const [localTheme, setLocalTheme] = useState(currentTheme || defaultTheme);

  useEffect(() => {
    if (isOpen) {
      setLocalTheme(currentTheme || defaultTheme);
    }
  }, [isOpen, currentTheme, defaultTheme]);

  if (!isOpen) return null;

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setLocalTheme(e.target.value);
  };

  const handleApply = () => {
    onThemeChange(localTheme);
    onClose();
  };

  const hasAIFineTuneOverrides = (theme: string): boolean => {
    return /\/\*\s*AI Fine-Tune Overrides\s*\*\//i.test(theme);
  };

  const handleResetAIFineTune = () => {
    let cleanedTheme = localTheme;
    if (hasAIFineTuneOverrides(cleanedTheme)) {
      cleanedTheme = cleanedTheme.replace(
        /\/\*\s*AI Fine-Tune Overrides\s*\*\/\s*[\s\S]*?(?=\/\*\s*AI Fine-Tune Overrides\s*\*\/|$)/gi,
        ""
      );
      cleanedTheme = cleanedTheme.replace(/\n{3,}/g, "\n\n").trim();
    }
    setLocalTheme(cleanedTheme);
    onThemeChange(cleanedTheme);
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-background-dark/95 flex items-center justify-center p-4"
      onClick={e => e.stopPropagation()}
      onKeyDown={e => e.stopPropagation()}
      onKeyUp={e => e.stopPropagation()}
      role="dialog"
      data-higher-modal="true"
    >
      <div className="bg-background-card border border-light/20 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-light/10">
          <h2 className="text-lg font-bold text-gray-200">Edit CSS Theme</h2>
          <Button onClick={onClose} variant="secondary" size="sm" type="button">
            Close
          </Button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <textarea
            value={localTheme}
            onChange={handleChange}
            className="w-full h-full min-h-[400px] bg-black/80 text-xs text-gray-300 font-mono p-3 rounded border border-light/10"
            placeholder="Edit your CSS theme here..."
          />
        </div>
        <div className="flex items-center justify-between p-4 border-t border-light/10 gap-2">
          <div className="flex gap-2">
            {hasAIFineTuneOverrides(localTheme) && (
              <Button
                onClick={handleResetAIFineTune}
                variant="secondary"
                size="sm"
                type="button"
              >
                Reset AI Fine-Tune
              </Button>
            )}
            <Button
              onClick={() => {
                const resetValue = savedTheme ?? defaultTheme;
                onThemeChange(resetValue);
                onClose();
              }}
              variant="danger"
              size="sm"
              type="button"
            >
              Reset
            </Button>
          </div>
          <Button
            onClick={handleApply}
            variant="primary"
            size="sm"
            type="button"
          >
            Apply Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ThemeEditorModal;
