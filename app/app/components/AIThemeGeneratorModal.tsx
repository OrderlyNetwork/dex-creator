import { FC, useState, useEffect } from "react";
import { useTranslation, Trans } from "~/i18n";
import { Button } from "./Button";
import FormInput from "./FormInput";
import { Card } from "./Card";
import { useThemeGeneration } from "../context/ThemeGenerationContext";

export interface AIThemeGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  viewMode?: "desktop" | "mobile";
  onGenerateTheme: (prompt: string, viewMode: "desktop" | "mobile") => void;
}

const AIThemeGeneratorModal: FC<AIThemeGeneratorModalProps> = ({
  isOpen,
  onClose,
  viewMode = "desktop",
  onGenerateTheme,
}) => {
  const { t } = useTranslation();
  const [themePrompt, setThemePrompt] = useState("");
  const { isGeneratingTheme } = useThemeGeneration();

  useEffect(() => {
    if (!isOpen) {
      setThemePrompt("");
    }
  }, [isOpen]);

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
            {t("theme.aiThemeGenerator")}
          </h2>
          <Button onClick={onClose} variant="secondary" size="sm" type="button">
            {t("common.close")}
          </Button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <div className="flex flex-col gap-4">
            <p className="text-xs text-gray-400">
              {t("theme.aiThemeGeneratorModal.describePrompt")}
            </p>
            <Card className="p-3" variant="default">
              <div className="flex items-start gap-2">
                <div className="i-mdi:information-outline text-primary-light h-4 w-4 mt-0.5 flex-shrink-0"></div>
                <div>
                  <p className="text-xs text-gray-300 mb-1">
                    <Trans
                      i18nKey="theme.aiThemeGeneratorModal.noteWithDesc"
                      components={[
                        <span
                          key="0"
                          className="text-primary-light font-medium"
                        />,
                      ]}
                    />
                  </p>
                  <ul className="text-xs text-gray-300 list-disc pl-4 space-y-0.5">
                    <li>{t("theme.aiThemeGeneratorModal.reviewInPreview")}</li>
                    <li>{t("theme.aiThemeGeneratorModal.adjustColors")}</li>
                  </ul>
                </div>
              </div>
            </Card>
            <FormInput
              id="themePrompt"
              label={t("theme.themeDescription")}
              value={themePrompt}
              onChange={e => setThemePrompt(e.target.value)}
              placeholder={t("theme.aiThemeGeneratorModal.placeholder")}
              helpText={t("theme.aiThemeGeneratorModal.helpText")}
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
              onGenerateTheme(themePrompt, viewMode);
            }}
            isLoading={isGeneratingTheme}
            loadingText={t("theme.aiThemeGeneratorModal.generating")}
            disabled={isGeneratingTheme}
            variant="primary"
            size="sm"
            type="button"
          >
            <span className="flex items-center gap-1">
              <div className="i-mdi:magic-wand h-4 w-4"></div>
              {t("theme.generateTheme")}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIThemeGeneratorModal;
