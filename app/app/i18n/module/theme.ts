/**
 * Theme editor / customization shared keys (consolidated from duplicate keys).
 */
export const theme = {
  "theme.currentTheme": "Current Theme",
  "theme.hideEditor": "Hide Editor",
  "theme.editCss": "Edit CSS",
  "theme.editYourCssTheme": "Edit your CSS theme here...",
  "theme.viewCssCode": "View CSS code",
  "theme.hideCssCode": "Hide CSS code",
  "theme.aiThemeGenerator": "AI Theme Generator",
  "theme.themeDescription": "Theme Description",
  "theme.generateTheme": "Generate Theme",
  "theme.selectAVariant": "Select a Variant",
  "theme.clickToSetDisplayname": "Click to set {{displayName}} Color",
  "theme.fonts": "Fonts",
  "theme.spacing": "Spacing",
  "theme.colorPalette": "Color Palette",
  "theme.borderRadius": "Border Radius",

  // theme.editor (from CurrentThemeEditor)
  "theme.editor.colorsHint":
    "Click on any color swatch below to edit with a color picker",
  "theme.editor.fontsHint":
    "Customize the font family and base font size used throughout your DEX interface",
  "theme.editor.roundedHint":
    "Adjust the rounded corners of your UI elements with the sliders",
  "theme.editor.spacingHint":
    "Adjust the spacing values used throughout your DEX interface",
  "theme.editor.tradingViewHint": "Configure TradingView color settings",

  // theme.colorSwatches
  "theme.colorSwatches.primaryColors": "Primary Colors",
  "theme.colorSwatches.statusColors": "Status Colors",
  "theme.colorSwatches.baseColors": "Base Colors",
  "theme.colorSwatches.tradingColors": "Trading Colors",
  "theme.colorSwatches.fillColors": "Fill Colors",
  "theme.colorSwatches.lineColors": "Line Colors",
  "theme.colorSwatches.otherColors": "Other Colors",
  "theme.colorSwatches.brandGradient": "Brand Gradient",
  "theme.colorSwatches.syncWithPrimary": "Sync with primary",
  "theme.colorSwatches.clickToEditColor":
    "Click to edit {{displayName}} Color, use checkbox to select",
  "theme.colorSwatches.invalidCssFormat":
    "Invalid CSS format for {{displayName}}",
  "theme.colorSwatches.notSet": "Not set",
  "theme.colorSwatches.invalidFormat": "Invalid format",
  "theme.colorSwatches.invalidGradientFormat": "Invalid gradient format",
  "theme.colorSwatches.brandGradientUsedFor":
    "Brand gradient is used for primary buttons and important UI elements",

  // theme.presetPreviewModal
  "theme.presetPreviewModal.selectThemePreset": "Select Theme Preset",
  "theme.presetPreviewModal.applyPreset": "Apply Preset",
  "theme.presetPreviewModal.applyThemePresetTitle": "Apply Theme Preset",
  "theme.presetPreviewModal.applyThemePresetDesc":
    "Applying this preset will <0>overwrite all your current theme customizations</0>, including",
  "theme.presetPreviewModal.allColorCustomizations": "All color customizations",
  "theme.presetPreviewModal.fontSettings": "Font settings",
  "theme.presetPreviewModal.borderRadiusAdjustments":
    "Border radius adjustments",
  "theme.presetPreviewModal.spacingModifications": "Spacing modifications",
  "theme.presetPreviewModal.aiFineTuneOverrides": "Any AI fine-tune overrides",
  "theme.presetPreviewModal.actionCannotBeUndone":
    "This action cannot be undone. Are you sure you want to continue?",
  "theme.presetPreviewModal.yesApplyPreset": "Yes, Apply Preset",

  // theme.previewModal (selectVariant uses theme.selectAVariant)
  "theme.previewModal.previewThemeChanges": "Preview Theme Changes",
  "theme.previewModal.old": "Old",
  "theme.previewModal.acceptTheme": "Accept Theme",
  "theme.previewModal.themePreview": "Theme Preview",
  "theme.previewModal.aiGeneratedTheme": "AI-Generated Theme",
  "theme.previewModal.aiGeneratedThemeDesc":
    "This theme was created by an AI based on your description. While we strive for quality results:",
  "theme.previewModal.colorsMayNotMatch":
    "Colors may not always perfectly match your description",
  "theme.previewModal.contrastMayNeedAdjustments":
    "Contrast ratios between elements might need adjustment",
  "theme.previewModal.combinationsMayNotLookIdeal":
    "Some color combinations might not look ideal in all contexts",
  "theme.previewModal.recommendation": "Recommendation",
  "theme.previewModal.recommendationDesc":
    "Use the preview functionality to see how your theme looks in a real DEX environment, and make adjustments as needed using the color editor below.",
  "theme.previewModal.applyTheme": "Apply Theme",

  // theme.editingTabs
  "theme.editingTabs.clickOnColorToEdit": "Click on any color to edit",
  "theme.editingTabs.customizeFontFamilyAndSize":
    "Customize font family and size",
  "theme.editingTabs.adjustValuesWithSliders": "Adjust values with the sliders",
  "theme.editingTabs.adjustSpacingWithSliders":
    "Adjust spacing values with the sliders",

  // theme.fontControls (from ThemeFontControls)
  "theme.fontControls.helpText":
    "Customize the font family and base font size used throughout your DEX interface.",
  "theme.fontControls.preview": "Preview",
  "theme.fontControls.category.default": "Default",
  "theme.fontControls.category.modern": "Modern",
  "theme.fontControls.category.readable": "Readable",
  "theme.fontControls.category.friendly": "Friendly",
  "theme.fontControls.category.elegant": "Elegant",
  "theme.fontControls.category.technical": "Technical",
  "theme.fontControls.previewDesc":
    "This is how your DEX interface text will look with the selected font and size.",
  "theme.fontControls.previewNote":
    "Trading pairs, prices, and all interface elements will use this styling.",

  // theme.roundedControls (from ThemeRoundedControls)
  "theme.roundedControls.helpText":
    "Adjust the border radius values used throughout your DEX interface",
  "theme.roundedControls.displayName.sm": "Small",
  "theme.roundedControls.displayName.base": "Base",
  "theme.roundedControls.displayName.md": "Medium",
  "theme.roundedControls.displayName.lg": "Large",
  "theme.roundedControls.displayName.xl": "Extra Large",
  "theme.roundedControls.displayName.2xl": "2X Large",
  "theme.roundedControls.displayName.full": "Full",
  "theme.roundedControls.fullRoundedCannotModify":
    "Full rounded value cannot be modified",

  // theme.customizationSection (from ThemeCustomizationSection)
  "theme.customizationSection.themePresets": "Theme Presets",
  "theme.customizationSection.selectPreset": "Select Preset",
  "theme.customizationSection.aiThemeGeneratorDesc":
    "Describe how you want your DEX theme to look and our AI will generate it for you.",
  "theme.customizationSection.note": "Note",
  "theme.customizationSection.aiNoteDesc":
    "AI-generated themes are a starting point and may not be perfect. After generating",
  "theme.customizationSection.reviewInPreview":
    "Review the theme in the preview modal",
  "theme.customizationSection.adjustColors":
    "Make adjustments to colors as needed",
  "theme.customizationSection.themeDescriptionPlaceholder":
    "e.g., A dark blue theme with neon green accents",
  "theme.customizationSection.themeDescriptionHelp":
    "Describe your desired color scheme and style",
  "theme.customizationSection.generating": "Generating...",

  // theme.currentThemeModal (from CurrentThemeModal)
  "theme.currentThemeModal.resetAIFineTune": "Reset AI Fine-Tune",

  // theme.aiThemeGeneratorModal (from AIThemeGeneratorModal)
  "theme.aiThemeGeneratorModal.describePrompt":
    "Describe how you want your DEX theme to look and our AI will generate it for you.",
  "theme.aiThemeGeneratorModal.noteWithDesc":
    "<0>Note</0>: AI-generated themes are a starting point and may not be perfect. After generating:",
  "theme.aiThemeGeneratorModal.reviewInPreview":
    "Review the theme in the preview modal",
  "theme.aiThemeGeneratorModal.adjustColors":
    "Make adjustments to colors as needed",
  "theme.aiThemeGeneratorModal.placeholder":
    "e.g., A dark blue theme with neon green accents",
  "theme.aiThemeGeneratorModal.helpText":
    "Describe your desired color scheme and style",
  "theme.aiThemeGeneratorModal.generating": "Generating...",
};
