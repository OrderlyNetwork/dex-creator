import { useCallback } from "react";
import { UseDexFormReturn } from "./useDexForm";
import { useModal } from "../context/ModalContext";
import { useThemeGeneration } from "../context/ThemeGenerationContext";
import { DexPreviewProps } from "../components/DexPreview";

interface UseThemeHandlersOptions {
  token: string | null;
  form: UseDexFormReturn;
  originalThemeCSS?: string | null;
  tradingViewColorConfig?: string | null;
}

export function useThemeHandlers({
  token,
  form,
  originalThemeCSS = null,
  tradingViewColorConfig = null,
}: UseThemeHandlersOptions) {
  const { openModal } = useModal();
  const { setIsGeneratingTheme } = useThemeGeneration();

  const handleApplyGeneratedTheme = useCallback(
    (modifiedCss: string) => {
      form.setCurrentTheme(modifiedCss);
    },
    [form]
  );

  const handleCancelGeneratedTheme = useCallback(() => {}, []);

  const handleGenerateTheme = useCallback(
    async (
      prompt?: string,
      previewProps?: DexPreviewProps,
      viewMode: "desktop" | "mobile" = "desktop"
    ) => {
      if (!token) return;

      setIsGeneratingTheme(true);
      try {
        await form.generateTheme(
          token,
          originalThemeCSS ?? undefined,
          handleApplyGeneratedTheme,
          handleCancelGeneratedTheme,
          openModal,
          prompt,
          previewProps,
          viewMode
        );
      } catch (error) {
        console.error("Error generating theme:", error);
      } finally {
        setIsGeneratingTheme(false);
      }
    },
    [
      token,
      originalThemeCSS,
      form,
      handleApplyGeneratedTheme,
      handleCancelGeneratedTheme,
      openModal,
      setIsGeneratingTheme,
    ]
  );

  const handleResetTheme = useCallback(
    (resetToOriginal: boolean = false) => {
      if (resetToOriginal && originalThemeCSS) {
        form.resetTheme(originalThemeCSS);
      } else {
        form.resetTheme(null);
      }
      form.setTradingViewColorConfig(tradingViewColorConfig ?? null);
      form.setShowThemeEditor(false);
      form.setViewCssCode(false);
    },
    [form, originalThemeCSS, tradingViewColorConfig]
  );

  const handleResetToDefault = useCallback(() => {
    form.resetThemeToDefault();
    form.setShowThemeEditor(false);
    form.setViewCssCode(false);
  }, [form]);

  return {
    handleApplyGeneratedTheme,
    handleCancelGeneratedTheme,
    handleGenerateTheme,
    handleResetTheme,
    handleResetToDefault,
  };
}
