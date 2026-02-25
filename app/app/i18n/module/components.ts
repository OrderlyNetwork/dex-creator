/**
 * components i18n keys, prefix is the component name (camelCase)
 */
export const components = {
  // LoginModal
  "loginModal.title": "Complete Your Login",
  "loginModal.description":
    "You're almost there! To secure your session, you'll need to sign a message with your wallet.",
  "loginModal.whySign": "Why do I need to sign?",
  "loginModal.whySignDesc":
    "Signing a message proves you own this wallet without sharing your private keys. This is a secure method that doesn't cost any gas fees or involve blockchain transactions.",
  "loginModal.later": "Later",
  "loginModal.signing": "Signing",
  "loginModal.signMessage": "Sign Message",

  // WalletConnect
  "walletConnect.connectWallet": "Connect Wallet",
  "walletConnect.connect": "Connect",
  "walletConnect.validating": "Validating",
  "walletConnect.login": "Login",
  "walletConnect.disconnect": "Disconnect",

  // Wallet (utils)
  "wallet.userRejectedRequest": "User rejected the request",

  // MobileNavigation
  "mobileNavigation.menu": "Menu",

  // ThemeEditorTabsModal
  "themeEditorTabsModal.title": "Theme Editor",
  "themeEditorTabsModal.close": "Close",
  "themeEditorTabsModal.resetToDefault": "Reset to Default",
  "themeEditorTabsModal.applyChanges": "Apply Changes",

  // OrderlyKeyLoginModal
  "orderlyKeyLoginModal.checkingAdminWallet": "Checking Admin Wallet",
  "orderlyKeyLoginModal.verifyingConfig":
    "Verifying your admin wallet configuration...",
  "orderlyKeyLoginModal.createOrderlyKey": "Create Orderly Key",
  "orderlyKeyLoginModal.createKeyDesc":
    "To interact with the Orderly Network API, you'll need to create an Orderly API key by signing a message with your wallet.",
  "orderlyKeyLoginModal.delegateKeyForMultisig":
    "Creating delegate key for multisig wallet",
  "orderlyKeyLoginModal.requiredNetwork": "Required network",
  "orderlyKeyLoginModal.whatHappensNext": "What happens next",
  "orderlyKeyLoginModal.step1": "Your wallet will prompt you to sign a message",
  "orderlyKeyLoginModal.step2": "An Orderly API key will be generated securely",
  "orderlyKeyLoginModal.step3":
    "The key will be stored locally for API interactions",
  "orderlyKeyLoginModal.securityNote": "Security Note",
  "orderlyKeyLoginModal.securityNoteDesc":
    "This key allows secure API access to manage your DEX settings and interact with the Orderly Network. It will be stored locally in your browser and is unique to your DEX broker account. No gas fees or blockchain transactions are required.",
  "orderlyKeyLoginModal.switchNetworkMultisig":
    "Please switch to {{networkName}} where your multisig delegate signer link was established.",
  "orderlyKeyLoginModal.switchNetworkChainId":
    "Please switch to the network where your multisig delegate signer link was established (Chain ID: {{chainId}}).",
  "orderlyKeyLoginModal.switchNetworkSupported":
    "Please switch to a supported network to create your Orderly key.",
  "orderlyKeyLoginModal.cancel": "Cancel",
  "orderlyKeyLoginModal.createKey": "Create Key",
  "orderlyKeyLoginModal.creatingKey": "Creating Key",
  "orderlyKeyLoginModal.switchNetwork": "Switch Network",

  // OrderlyKey (useCreateOrderlyKey hook)
  "orderlyKey.createFailed": "Failed to create orderly key",

  // ThemeFontControls
  "themeFontControls.helpText":
    "Customize the font family and base font size used throughout your DEX interface.",
  "themeFontControls.preview": "Preview",
  "themeFontControls.fontFamily": "Font Family",
  "themeFontControls.fontSize": "Font Size",
  "themeFontControls.fontSizeValue": "Font size value",
  "themeFontControls.category.default": "Default",
  "themeFontControls.category.modern": "Modern",
  "themeFontControls.category.readable": "Readable",
  "themeFontControls.category.friendly": "Friendly",
  "themeFontControls.category.elegant": "Elegant",
  "themeFontControls.category.technical": "Technical",
  "themeFontControls.previewDesc":
    "This is how your DEX interface text will look with the selected font and size.",
  "themeFontControls.previewNote":
    "Trading pairs, prices, and all interface elements will use this styling.",

  // ThemeRoundedControls
  "themeRoundedControls.helpText":
    "Adjust the border radius values used throughout your DEX interface",
  "themeRoundedControls.displayName.sm": "Small",
  "themeRoundedControls.displayName.base": "Base",
  "themeRoundedControls.displayName.md": "Medium",
  "themeRoundedControls.displayName.lg": "Large",
  "themeRoundedControls.displayName.xl": "Extra Large",
  "themeRoundedControls.displayName.2xl": "2X Large",
  "themeRoundedControls.displayName.full": "Full",
  "themeRoundedControls.fullRoundedCannotModify":
    "Full rounded value cannot be modified",

  // ThemeCustomizationSection
  "themeCustomizationSection.themePresets": "Theme Presets",
  "themeCustomizationSection.selectPreset": "Select Preset",
  "themeCustomizationSection.currentTheme": "Current Theme",
  "themeCustomizationSection.hideEditor": "Hide Editor",
  "themeCustomizationSection.editCss": "Edit CSS",
  "themeCustomizationSection.reset": "Reset",
  "themeCustomizationSection.editCssPlaceholder": "Edit your CSS theme here...",
  "themeCustomizationSection.viewCssCode": "View CSS code",
  "themeCustomizationSection.hideCssCode": "Hide CSS code",
  "themeCustomizationSection.aiThemeGenerator": "AI Theme Generator",
  "themeCustomizationSection.aiThemeGeneratorDesc":
    "Describe how you want your DEX theme to look and our AI will generate it for you.",
  "themeCustomizationSection.note": "Note",
  "themeCustomizationSection.aiNoteDesc":
    "AI-generated themes are a starting point and may not be perfect. After generating",
  "themeCustomizationSection.reviewInPreview":
    "Review the theme in the preview modal",
  "themeCustomizationSection.adjustColors":
    "Make adjustments to colors as needed",
  "themeCustomizationSection.themeDescription": "Theme Description",
  "themeCustomizationSection.themeDescriptionPlaceholder":
    "e.g., A dark blue theme with neon green accents",
  "themeCustomizationSection.themeDescriptionHelp":
    "Describe your desired color scheme and style",
  "themeCustomizationSection.generateTheme": "Generate Theme",
  "themeCustomizationSection.generating": "Generating...",

  // CurrentThemeModal
  "currentThemeModal.title": "Current Theme",
  "currentThemeModal.close": "Close",
  "currentThemeModal.hideEditor": "Hide Editor",
  "currentThemeModal.editCss": "Edit CSS",
  "currentThemeModal.editCssPlaceholder": "Edit your CSS theme here...",
  "currentThemeModal.viewCssCode": "View CSS code",
  "currentThemeModal.hideCssCode": "Hide CSS code",
  "currentThemeModal.resetAIFineTune": "Reset AI Fine-Tune",
  "currentThemeModal.reset": "Reset",
  "currentThemeModal.applyChanges": "Apply Changes",

  // WorkflowStatus
  "workflowStatus.loading": "Loading workflow status...",
  "workflowStatus.errorTitle": "Workflow Status Error",
  "workflowStatus.retry": "Retry",
  "workflowStatus.waitingForWorkflows": "Waiting for workflows to start...",
  "workflowStatus.workflowStatus": "Workflow Status",
  "workflowStatus.workflowStatusNamed": '"{{workflowName}}" Workflow Status',
  "workflowStatus.refresh": "Refresh",
  "workflowStatus.noRecentRuns": "No recent workflow runs found",
  "workflowStatus.loadingDetails": "Loading...",
  "workflowStatus.runId": "Run #{{runId}}",
  "workflowStatus.showingRecent":
    "Showing 5 most recent of {{total}} total runs",
  "workflowStatus.loadingWorkflowDetails": "Loading workflow details...",
  "workflowStatus.runDetails": "Run Details",
  "workflowStatus.viewOnGitHub": "View on GitHub",
  "workflowStatus.closeDetails": "Close details",
  "workflowStatus.status": "Status",
  "workflowStatus.started": "Started",
  "workflowStatus.lastUpdated": "Last updated",
  "workflowStatus.jobs": "Jobs",
  "workflowStatus.success": "Success",
  "workflowStatus.failed": "Failed",
  "workflowStatus.inProgress": "In Progress",
  "workflowStatus.cancelled": "Cancelled",
  "workflowStatus.completed": "Completed",
  "workflowStatus.failedToLoadDetails": "Failed to load workflow details",
  "workflowStatus.couldNotFetchDetails": "Could not fetch workflow run details",
  "workflowStatus.fetchError": "Failed to fetch workflow status: {{message}}",
  "workflowStatus.unknownError": "Unknown error",

  // Pagination
  "pagination.show": "Show",
  "pagination.perPage": "per page",
  "pagination.showingRange":
    "Showing {{startItem}} to {{endItem}} of {{totalItems}} {{itemName}}",

  // ConfirmationModal
  "confirmationModal.processing": "Processing...",
  "confirmationModal.warning": "⚠️ Warning",
  "confirmationModal.important": "ℹ️ Important",
  "confirmationModal.cancel": "Cancel",

  // DeleteConfirmModal
  "deleteConfirmModal.title": "Delete {{entityName}}",
  "deleteConfirmModal.confirmMessage":
    "Are you sure you want to delete this {{entityNameLower}}? This action cannot be undone.",
  "deleteConfirmModal.warningTitle": "Warning",
  "deleteConfirmModal.warningDesc":
    "Deleting your {{entityNameLower}} will permanently remove all associated data from the system, including the GitHub repository. However, any deployed instances on GitHub Pages will remain active and must be manually disabled through GitHub.",
  "deleteConfirmModal.cancel": "Cancel",
  "deleteConfirmModal.deleting": "Deleting",
  "deleteConfirmModal.deleteButton": "Delete {{entityName}}",

  // Footer
  "footer.developers": "Developers",
  "footer.documentation": "Documentation",
  "footer.github": "GitHub",
  "footer.orderlySdks": "Orderly SDKs",
  "footer.traders": "Traders",
  "footer.tradeOnBuilders": "Trade on Builders",
  "footer.orderlyExplorer": "Orderly Explorer",
  "footer.orderlyDashboard": "Orderly Dashboard",
  "footer.apiDocs": "API Docs",
  "footer.ecosystem": "Ecosystem",
  "footer.partners": "Partners",
  "footer.blog": "Blog",
  "footer.listing": "Listing",
  "footer.about": "About",
  "footer.team": "Team",
  "footer.analytics": "Analytics",
  "footer.pressKit": "Press Kit",
  "footer.careers": "Careers",
  "footer.legal": "Legal",
  "footer.privacyPolicy": "Privacy Policy",
  "footer.termsOfService": "Terms of Service",
  "footer.builderGuidelines": "Builder Guidelines",
  "footer.supplementalTermsForDexs": "Supplemental Terms for DEXs",

  "languageSwitcher.language": "Language",
  "languageSwitcher.tooltip": "Switch language",
  "languageSwitcher.tips":
    "AI-generated translations may not be fully accurate.",

  // ConnectWalletAuthGuard
  "connectWalletAuthGuard.title": "Connect wallet",
  "connectWalletAuthGuard.description":
    "Authentication required. Please connect your wallet and login.",

  // GraduationAuthGuard
  "graduationAuthGuard.title": "Graduation Required",
  "graduationAuthGuard.description":
    "The feature you are trying to access is only available for graduated DEXs. You need to graduate your DEX first to access the feature.",
  "graduationAuthGuard.graduateButton": "Graduate Your DEX",

  // OrderlyKeyAuthGuard
  "orderlyKeyAuthGuard.title": "Orderly Key Required",
  "orderlyKeyAuthGuard.description":
    "This key provides secure access to the Orderly Network API. It will be stored locally to manage your distributor profile. A wallet signature is required to create this key.",
  "orderlyKeyAuthGuard.creatingKey": "Creating Key...",
  "orderlyKeyAuthGuard.createButton": "Create Orderly Key",

  // AccordionItem
  "accordionItem.completePreviousSteps":
    "Please complete the previous required steps first.",
  "accordionItem.optional": "Optional",
  "accordionItem.skip": "Skip",
  "accordionItem.next": "Next",

  // AdminLoginModal
  "adminLoginModal.errorGeneratingPublicKey": "Error generating public key",
  "adminLoginModal.labelCopiedToClipboard": "{{label}} copied to clipboard!",
  "adminLoginModal.failedToCopy": "Failed to copy to clipboard",
  "adminLoginModal.title": "Admin Dashboard Login",
  "adminLoginModal.copyCredentialsDesc":
    "Copy these credentials to log into the Orderly Admin Dashboard. Keep your private key secure!",
  "adminLoginModal.accountId": "Account ID",
  "adminLoginModal.publicKey": "Public Key (Orderly Key)",
  "adminLoginModal.privateKey": "Private Key (Secret Key)",
  "adminLoginModal.neverSharePrivateKey":
    "⚠️ Never share your private key with anyone!",
  "adminLoginModal.howToLogIn": "How to log in:",
  "adminLoginModal.step1": "Open the Admin Dashboard link",
  "adminLoginModal.step2": "Paste your Account ID in the first field",
  "adminLoginModal.step3": "Paste your Public Key in the second field",
  "adminLoginModal.step4": "Paste your Private Key in the third field",
  "adminLoginModal.step5": 'Click "Sign In" to access your broker settings',
  "adminLoginModal.close": "Close",
  "adminLoginModal.openAdminDashboard": "Open Admin Dashboard",

  // AIFineTuneModal
  "aiFineTuneModal.pleaseEnterDescription": "Please enter a description",
  "aiFineTuneModal.authenticationRequired": "Authentication required",
  "aiFineTuneModal.noElementSelected": "No element selected",
  "aiFineTuneModal.overridesGeneratedSuccess":
    "CSS overrides generated successfully!",
  "aiFineTuneModal.failedToGenerateOverrides":
    "Failed to generate CSS overrides",
  "aiFineTuneModal.rateLimitExceeded":
    "Rate limit exceeded. Please wait 30 seconds before trying again.",
  "aiFineTuneModal.errorGeneratingOverrides":
    "Error generating CSS overrides. Please try again.",
  "aiFineTuneModal.title": "AI Fine-Tune Element",
  "aiFineTuneModal.close": "Close",
  "aiFineTuneModal.describePrompt":
    "Describe how you want this element and its children to look. The AI will generate CSS overrides for the entire HTML structure.",
  "aiFineTuneModal.note": "Note",
  "aiFineTuneModal.noteDesc":
    "This will generate CSS overrides for the selected element and all its child elements. The changes will be applied as CSS classes or selectors targeting the structure.",
  "aiFineTuneModal.elements": "Elements",
  "aiFineTuneModal.elementsCount": "{{count}} element(s) (depth 0-3)",
  "aiFineTuneModal.description": "Description",
  "aiFineTuneModal.placeholder":
    "e.g., Make this button bright neon green with rounded corners and a glow effect",
  "aiFineTuneModal.helpText":
    "Describe the visual changes you want for this element",
  "aiFineTuneModal.generating": "Generating...",
  "aiFineTuneModal.generateOverrides": "Generate Overrides",

  // AIFineTunePreviewModal
  "aiFineTunePreviewModal.title": "Preview Fine-Tune Changes",
  "aiFineTunePreviewModal.old": "Old",
  "aiFineTunePreviewModal.reject": "Reject",
  "aiFineTunePreviewModal.selectVariant": "Select a Variant",
  "aiFineTunePreviewModal.acceptChanges": "Accept Changes",

  // AIThemeGeneratorModal
  "aiThemeGeneratorModal.title": "AI Theme Generator",
  "aiThemeGeneratorModal.close": "Close",
  "aiThemeGeneratorModal.describePrompt":
    "Describe how you want your DEX theme to look and our AI will generate it for you.",
  "aiThemeGeneratorModal.noteWithDesc":
    "<0>Note</0>: AI-generated themes are a starting point and may not be perfect. After generating:",
  "aiThemeGeneratorModal.reviewInPreview":
    "Review the theme in the preview modal",
  "aiThemeGeneratorModal.adjustColors": "Make adjustments to colors as needed",
  "aiThemeGeneratorModal.themeDescription": "Theme Description",
  "aiThemeGeneratorModal.placeholder":
    "e.g., A dark blue theme with neon green accents",
  "aiThemeGeneratorModal.helpText":
    "Describe your desired color scheme and style",
  "aiThemeGeneratorModal.generating": "Generating...",
  "aiThemeGeneratorModal.generateTheme": "Generate Theme",

  // AllDexesList
  "allDexesList.labelCopiedToClipboard": "{{label}} copied to clipboard",
  "allDexesList.failedToCopyLabel": "Failed to copy {{label}}",
  "allDexesList.failedToLoadDexes": "Failed to load DEXs",
  "allDexesList.browseAllDexes": "Browse All DEXs",
  "allDexesList.refreshDexList": "Refresh DEX list",
  "allDexesList.comprehensiveListDesc":
    "A comprehensive list of all DEXs and their database values.",
  "allDexesList.searchPlaceholder": "Search by broker name or broker ID...",
  "allDexesList.clearSearch": "Clear search",
  "allDexesList.loadingDexes": "Loading DEXs...",
  "allDexesList.noDexesFound": "No DEXs found.",
  "allDexesList.searching": "Searching...",
  "allDexesList.unnamedDex": "Unnamed DEX",
  "allDexesList.dexIdLabel": "DEX ID",
  "allDexesList.copyDexId": "Copy full DEX ID",
  "allDexesList.brokerIdLabel": "Broker ID",
  "allDexesList.copyBrokerId": "Copy Broker ID",
  "allDexesList.repoUrlLabel": "Repository URL",
  "allDexesList.repoUrlHeading": "Repo URL:",
  "allDexesList.copyRepoUrl": "Copy Repository URL",
  "allDexesList.customDomainUrlLabel": "Custom Domain URL",
  "allDexesList.customDomainHeading": "Custom Domain:",
  "allDexesList.copyCustomDomainUrl": "Copy Custom Domain URL",
  "allDexesList.customDomainOverride": "Custom Domain Override",
  "allDexesList.updating": "Updating...",
  "allDexesList.update": "Update",
  "allDexesList.overrideUrlLabel": "Custom Domain Override URL",
  "allDexesList.overrideUrl": "Override URL",
  "allDexesList.overrideUrlHeading": "Override URL:",
  "allDexesList.copyOverrideUrl": "Copy Override URL",
  "allDexesList.deploymentUrlLabel": "Deployment URL",
  "allDexesList.deploymentUrl": "Deployment URL",
  "allDexesList.deploymentUrlHeading": "Deployment URL:",
  "allDexesList.copyDeploymentUrl": "Copy Deployment URL",
  "allDexesList.actions": "Actions",
  "allDexesList.deploying": "Deploying...",
  "allDexesList.redeploy": "Redeploy",
  "allDexesList.cssTheme": "CSS Theme",
  "allDexesList.hideTheme": "Hide theme",
  "allDexesList.showTheme": "Show theme",
  "allDexesList.cssThemeLabel": "CSS Theme",
  "allDexesList.copyCssTheme": "Copy CSS Theme",
  "allDexesList.itemName": "DEXs",

  // AnalyticsConfigSection
  "analyticsConfigSection.label": "Analytics Script",
  "analyticsConfigSection.placeholder":
    "Paste your analytics script here (including <script> tags)\n\nExample:\n<script async src='https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX'></script>\n<script>\n  window.dataLayer = window.dataLayer || [];\n  function gtag(){dataLayer.push(arguments);}\n  gtag('js', new Date());\n  gtag('config', 'G-XXXXXXXXXX');\n</script>",
  "analyticsConfigSection.addScriptDesc":
    "Add your analytics tracking script from any provider that uses script tags. The script will be securely injected into your DEX.",
  "analyticsConfigSection.noteDesc":
    "<0>Note</0>: Include the complete script tags exactly as provided by your analytics service. The script will be placed in the DEX's HTML head section.",
  "analyticsConfigSection.characters": "characters",

  // AppKitProvider
  "appKitProvider.switchedToChain": "Switched to {{chainName}}",

  // AssetFilterSection
  "assetFilterSection.loadingAssets": "Loading available assets...",
  "assetFilterSection.title": "Asset Filtering",
  "assetFilterSection.description":
    "Select which trading pairs will be displayed in your DEX. Leave empty to show all available assets.",
  "assetFilterSection.clearFilter": "Clear Filter",
  "assetFilterSection.allAssetsMode": "🌐 All Assets Mode (Default)",
  "assetFilterSection.noSpecificAssetsDesc":
    "No specific assets selected. Your DEX will display ",
  "assetFilterSection.allAvailableTradingPairs": "all available trading pairs",
  "assetFilterSection.fromOrderlyNetwork": " from the Orderly Network.",
  "assetFilterSection.availableAssetsCount": "Available Assets ({{count}})",
  "assetFilterSection.selectAllFiltered": "Select All Filtered",
  "assetFilterSection.clearFiltered": "Clear Filtered",
  "assetFilterSection.searchPlaceholder":
    "Search assets (e.g., BTC, ETH, SOL)...",
  "assetFilterSection.noAssetsMatching":
    'No assets found matching "{{searchQuery}}"',
  "assetFilterSection.vol": "Vol",

  // BackDexDashboard
  "backDexDashboard.backToDex": "Back to DEX Dashboard",

  // BaseFeeExplanation
  "baseFeeExplanation.title": "Understanding Base Fees & Staking Tiers",
  "baseFeeExplanation.baseFee": "Base Fee",
  "baseFeeExplanation.baseFeeIntro":
    "Orderly retains 100% of a base taker fee while offering 0 bps maker fee. This fee varies by tier in our Builder Staking Programme:",
  "baseFeeExplanation.tier": "Tier",
  "baseFeeExplanation.volumeRequirement": "Volume Requirement (30d)",
  "baseFeeExplanation.stakingRequirement": "Staking Requirement",
  "baseFeeExplanation.orderlyBaseTakerFee": "Orderly Base Taker Fee (bps)",
  "baseFeeExplanation.public": "PUBLIC",
  "baseFeeExplanation.noRequirement": "No Requirement",
  "baseFeeExplanation.dash": "-",
  "baseFeeExplanation.silver": "SILVER",
  "baseFeeExplanation.gold": "GOLD",
  "baseFeeExplanation.platinum": "PLATINUM",
  "baseFeeExplanation.diamond": "DIAMOND",
  "baseFeeExplanation.vol30m": "≥ $30M",
  "baseFeeExplanation.or": "OR",
  "baseFeeExplanation.stake100k": "100K $ORDER",
  "baseFeeExplanation.vol90m": "≥ $90M",
  "baseFeeExplanation.stake250k": "250K $ORDER",
  "baseFeeExplanation.vol1b": "≥ $1B",
  "baseFeeExplanation.stake2m": "2M $ORDER",
  "baseFeeExplanation.vol10b": "≥ $10B",
  "baseFeeExplanation.stake7m": "7M $ORDER",
  "baseFeeExplanation.whatDoesThisMean": "What does this mean for you?",
  "baseFeeExplanation.viewDocumentation": "View documentation",
  "baseFeeExplanation.customFeeDesc":
    "Your custom fee settings represent the total fees that traders pay. Your revenue is calculated by subtracting the base fee from your custom fees:",
  "baseFeeExplanation.baseFeeRetainedDesc":
    "Base Fee (retained by Orderly): Ranges from 3.00 bps (Public tier) to 1.00 bps (Diamond tier) - this is deducted from your custom fees",
  "baseFeeExplanation.yourRevenue": "Your Revenue: Your Custom Fee - Base Fee",
  "baseFeeExplanation.stakingTip":
    "By staking more ORDER tokens or achieving higher trading volume, you can reduce the base fee charged by Orderly, maximizing your DEX's competitiveness.",
  "baseFeeExplanation.stakeOrderCta": "Stake ORDER for Better Rates",
  "baseFeeExplanation.importantWalletNote":
    "<0>Important</0>: You must use the <1>exact same wallet</1> for staking ORDER tokens that you used to set up this DEX. This ensures proper tier attribution and benefits.",

  // BlockchainConfigSection
  "blockchainConfigSection.title": "Supported Blockchains",
  "blockchainConfigSection.description":
    "Select which blockchains your DEX will support. Users will be able to trade on these networks.",
  "blockchainConfigSection.selectAll": "Select All",
  "blockchainConfigSection.clearAll": "Clear All",
  "blockchainConfigSection.allChainsMode": "🌐 All Chains Mode (Default)",
  "blockchainConfigSection.noChainsSelectedDesc":
    "No specific chains selected. Your DEX will automatically support ",
  "blockchainConfigSection.allCurrentAndFuture":
    "all current and future blockchains",
  "blockchainConfigSection.addedToOrderly":
    " added to the Orderly Network. This ensures maximum compatibility and future-proofing without needing updates.",
  "blockchainConfigSection.defaultChainLabel": "Default Chain (Optional)",
  "blockchainConfigSection.defaultChainHelp":
    "Choose which mainnet blockchain your DEX will use by default when users first connect. Users can always switch to other supported chains afterward.",
  "blockchainConfigSection.noDefaultChain": "No default chain",
  "blockchainConfigSection.selectedDefault": "Selected default:",
  "blockchainConfigSection.chainIdFallback": "Chain {{chainId}}",
  "blockchainConfigSection.disableMainnet": "Disable Mainnet",
  "blockchainConfigSection.cannotDisableMainnet":
    "Cannot disable mainnet when testnet is already disabled",
  "blockchainConfigSection.disableTestnet": "Disable Testnet",
  "blockchainConfigSection.cannotDisableTestnet":
    "Cannot disable testnet when mainnet is already disabled",
  "blockchainConfigSection.invalidConfig": "⚠️ Invalid Configuration",
  "blockchainConfigSection.cannotDisableBoth":
    "Cannot disable both mainnet and testnet. Your DEX needs to support at least one network type.",
  "blockchainConfigSection.mainnetNetworks": "Mainnet Networks",
  "blockchainConfigSection.disabled": "Disabled",
  "blockchainConfigSection.layer1Networks": "Layer 1 Networks",
  "blockchainConfigSection.layer2Networks": "Layer 2 Networks",
  "blockchainConfigSection.mainnetDisabled": "Mainnet networks are disabled",
  "blockchainConfigSection.testnetNetworks": "Testnet Networks",
  "blockchainConfigSection.testnetDisabled": "Testnet networks are disabled",
  "blockchainConfigSection.testnetBadge": "Testnet",
  "blockchainConfigSection.defaultBadge": "Default",
  "blockchainConfigSection.usingAllChainsMode":
    "Using All Chains Mode - supporting all current and future blockchains",
  "blockchainConfigSection.selectedCount":
    "Selected {{count}} blockchain(s) • {{mainnetCount}} Mainnet, {{testnetCount}} Testnet",

  // BrandingSection
  "brandingSection.primaryLogo": "Primary Logo",
  "brandingSection.optional": "(optional)",
  "brandingSection.primaryLogoHelp":
    "This will be used as the main logo in your DEX, typically displayed prominently on desktop views.",
  "brandingSection.secondaryLogo": "Secondary Logo",
  "brandingSection.secondaryLogoHelp":
    "This will be used in other areas like the footer, on mobile views, and in some dialogs.",
  "brandingSection.favicon": "Favicon",
  "brandingSection.faviconHelp":
    "This is the small icon that appears next to your website's name in a browser tab or in a list of bookmarks, helping users easily identify your DEX.",

  // BrokerDetailsSection
  "brokerDetailsSection.label": "Broker Name",
  "brokerDetailsSection.placeholder": "Enter your broker name",
  "brokerDetailsSection.helpText":
    "This name will be used in the HTML metadata, environment configuration, and other places throughout your DEX. Must be 3-30 characters and can only contain letters, numbers, spaces, dots, hyphens, and underscores.",

  // ColorSwatch
  "colorSwatch.clickToEditColor":
    "Click to edit {{displayName}} Color, use checkbox to select",
  "colorSwatch.clickToSetColor": "Click to set {{displayName}} Color",
  "colorSwatch.invalidCssFormat": "Invalid CSS format for {{displayName}}",
  "colorSwatch.notSet": "Not set",
  "colorSwatch.invalidFormat": "Invalid format",

  // CSSVariableInspector
  "cssVariableInspector.title": "CSS Variables",
  "cssVariableInspector.aiFineTuneOverrides": "AI Fine-Tune Overrides",
  "cssVariableInspector.edit": "Edit",
  "cssVariableInspector.delete": "Delete",
  "cssVariableInspector.cssPropertiesPlaceholder": "CSS properties...",
  "cssVariableInspector.save": "Save",
  "cssVariableInspector.cancel": "Cancel",
  "cssVariableInspector.aiFineTuneButton": "AI Fine-Tune This Element",
  "cssVariableInspector.aiFineTuneHint":
    "Use AI to customize this element and its children",
  "cssVariableInspector.noVariablesFound":
    "No CSS variables found for this element",

  // CurrentThemeEditor
  "currentThemeEditor.tab.colors": "Color Palette",
  "currentThemeEditor.tab.fonts": "Fonts",
  "currentThemeEditor.tab.rounded": "Border Radius",
  "currentThemeEditor.tab.spacing": "Spacing",
  "currentThemeEditor.tab.tradingview": "TradingView",
  "currentThemeEditor.colorsHint":
    "Click on any color swatch below to edit with a color picker",
  "currentThemeEditor.fontsHint":
    "Customize the font family and base font size used throughout your DEX interface",
  "currentThemeEditor.roundedHint":
    "Adjust the rounded corners of your UI elements with the sliders",
  "currentThemeEditor.spacingHint":
    "Adjust the spacing values used throughout your DEX interface",
  "currentThemeEditor.tradingViewHint": "Configure TradingView color settings",

  // CustomDomainSection
  "customDomainSection.title": "Custom Domain Setup",
  "customDomainSection.intro":
    "Deploy your DEX to your own domain instead of using the default GitHub Pages URL. You'll need to configure your domain's DNS settings to point to GitHub Pages.",
  "customDomainSection.limitedMobileFunctionality":
    "Limited Mobile Functionality",
  "customDomainSection.limitedMobileDesc":
    "Your DEX is currently using the default deployment domain. This means a special mobile feature that allows users to connect to their mobile device without requiring a mobile wallet will not work.",
  "customDomainSection.configureCustomDomain":
    "Configure a custom domain below to enable this mobile connection feature for your users.",
  "customDomainSection.importantLicenseRequirement":
    "Important License Requirement",
  "customDomainSection.licenseNote":
    "When using your own custom domain, you are required to apply for your own TradingView Advanced Charts license. The default license only covers the default domain.",
  "customDomainSection.applyForLicense":
    "Apply for TradingView Advanced Charts license",
  "customDomainSection.needHelp": "Need help? Read our guide",
  "customDomainSection.domainConfigured": "Domain Configured",
  "customDomainSection.availableAt": "Your DEX is available at",
  "customDomainSection.dnsConfigStatus": "DNS Configuration Status",
  "customDomainSection.dnsPropagationNote":
    "It may take up to 24 hours for DNS changes to propagate. If your domain is not working yet, please check back later.",
  "customDomainSection.editDomain": "Edit Domain",
  "customDomainSection.removeCustomDomain": "Remove Custom Domain",
  "customDomainSection.removing": "Removing...",
  "customDomainSection.editingDomain": "Editing Domain",
  "customDomainSection.currentDomain": "Current domain",
  "customDomainSection.domainName": "Domain Name",
  "customDomainSection.update": "Update",
  "customDomainSection.cancel": "Cancel",
  "customDomainSection.domainInputHint":
    "Enter your domain without 'http://' or 'https://' (e.g., example.com)",
  "customDomainSection.setDomain": "Set Domain",
  "customDomainSection.saving": "Saving...",
  "customDomainSection.needToPurchaseDomain": "Need to Purchase a Domain?",
  "customDomainSection.purchaseDomainDesc":
    "Don't have a domain yet? We've created step-by-step guides to help you purchase and configure your domain with popular providers.",
  "customDomainSection.showStepByStepGuide": "Show Step-by-Step Guide",
  "customDomainSection.dnsInstructions": "DNS Configuration Instructions",
  "customDomainSection.dnsIntro":
    "To use a custom domain, you'll need to configure your domain's DNS settings",
  "customDomainSection.step1AddARecords":
    "<0>Step 1:</0> Add <1>A records</1> for your apex domain:",
  "customDomainSection.step2AddCname":
    "Step 2: Add a CNAME record for www subdomain (required for SSL certificate):",
  "customDomainSection.valuesCreate4Records":
    "Values (create 4 separate A records):",
  "customDomainSection.ttlOrAutomatic": "(or automatic)",
  "customDomainSection.addCnameRecord":
    "Add a CNAME record with the following values:",
  "customDomainSection.dnsConfigDepends":
    "DNS configuration depends on your domain type:",
  "customDomainSection.forApexDomains": "For apex domains (example.com):",
  "customDomainSection.step1ARecords": "Step 1: A Records",
  "customDomainSection.step2WwwCname": "Step 2: www CNAME (required for SSL)",
  "customDomainSection.forSubdomains": "For subdomains (dex.example.com):",
  "customDomainSection.importantAboutDomainUpdates":
    "Important: About Domain Updates",
  "customDomainSection.domainUpdateNote":
    "After adding or removing a custom domain, a deployment process must complete for the changes to take effect. Your domain will not work correctly until this process finishes (usually 2-5 minutes).",
  "customDomainSection.monitorDeployment":
    'You can monitor the deployment status in the "Updates & Deployment Status" section below.',
  "customDomainSection.apexDomainNote":
    "You've configured an apex domain ({{domain}}). You must create 4 separate A records with the IP addresses shown above.",
  "customDomainSection.subdomainNote":
    "You've configured a subdomain ({{subdomain}}). Use the exact subdomain name shown above in the Name field.",
  "customDomainSection.chooseDomainType":
    "Choose between an apex domain (example.com) using A records or a subdomain (dex.example.com) using a CNAME record.",
  "customDomainSection.dnsPropagationTime":
    "DNS changes can take up to 24 hours to propagate globally, though they often complete within a few hours.",
  "customDomainSection.recommendedEmailSecurity":
    "Recommended: Email Security Records",
  "customDomainSection.emailSecurityDesc":
    "Add these TXT records to protect your domain from email spoofing attacks. Without these records, attackers could send phishing emails that appear to come from your domain, which may cause your site to be flagged by Google Safe Browsing.",
  "customDomainSection.spfRecord": "SPF Record (Sender Policy Framework)",
  "customDomainSection.dmarcRecord": "DMARC Record (Email Authentication)",
  "customDomainSection.whatTheseRecordsDo":
    "<0>What these records do:</0> They tell email servers that your domain doesn't send emails and to reject any emails claiming to be from your domain.",
  "customDomainSection.whyThisMatters":
    "<0>Why this matters:</0> Prevents attackers from spoofing your domain to send phishing emails, which could get your site flagged by Google Safe Browsing.",
  "customDomainSection.noteEmailRecords":
    "<0>Note:</0> Only add these records if your domain won't be used for sending legitimate emails. If you plan to send emails from this domain, consult your email provider for proper SPF/DMARC configuration.",
  "customDomainSection.copiedToClipboard": "Copied to clipboard",
  "customDomainSection.domainEmpty": "Domain name cannot be empty",
  "customDomainSection.domainLowercase":
    "Domain must be lowercase with no leading/trailing spaces",
  "customDomainSection.domainInvalid":
    "Please enter a valid domain name (e.g., example.com)",
  "customDomainSection.domainNoConsecutiveDots":
    "Domain cannot have consecutive dots or start/end with a dot",
  "customDomainSection.ipNotAllowed":
    "IP addresses are not allowed. Please use a domain name",
  "customDomainSection.domainUpdatedSuccess":
    "Custom domain updated successfully",
  "customDomainSection.domainConfiguredSuccess":
    "Custom domain configured successfully",
  "customDomainSection.failedToUpdate": "Failed to update custom domain",
  "customDomainSection.failedToSet": "Failed to set custom domain",
  "customDomainSection.dnsRecordType": "Type",
  "customDomainSection.dnsRecordName": "Name",
  "customDomainSection.dnsRecordValue": "Value",
  "customDomainSection.dnsRecordValues": "Values",
  "customDomainSection.dnsRecordTtl": "TTL",
  "customDomainSection.yourSubdomain": "your subdomain",

  // CustomMenuEditor
  "customMenuEditor.title": "Custom Navigation Menus",
  "customMenuEditor.description":
    "Add custom navigation links that will appear in your DEX's navigation bar",
  "customMenuEditor.noMenusYet": "No custom menus yet",
  "customMenuEditor.addFirstLink":
    "Add your first custom navigation link to get started",
  "customMenuEditor.addFirstMenu": "Add First Menu",
  "customMenuEditor.menuOrder": "Menu Order",
  "customMenuEditor.dragToReorder": "Drag items to reorder",
  "customMenuEditor.menuName": "Menu Name",
  "customMenuEditor.menuNamePlaceholder": "e.g., Documentation",
  "customMenuEditor.url": "URL",
  "customMenuEditor.addAnotherMenu": "Add Another Menu",
  "customMenuEditor.urlRequired": "URL is required when name is provided",
  "customMenuEditor.nameRequired": "Name is required when URL is provided",
  "customMenuEditor.invalidUrlFormat": "Invalid URL format",
  "customMenuEditor.completeAllItems":
    "Please complete all menu items with valid names and URLs",
  "customMenuEditor.menusConfigured": "{{count}} custom menu configured",
  "customMenuEditor.menusConfiguredPlural": "{{count}} custom menus configured",
  "customMenuEditor.examples": "Examples",
  "customMenuEditor.removeMenuItem": "Remove menu item",
  "customMenuEditor.helpCenterExample": "Help Center",
  "customMenuEditor.apiDocsExample": "API Documentation",

  // SEOConfigSection
  "seoConfigSection.seoConfiguration": "SEO Configuration",
  "seoConfigSection.seoConfigDesc":
    "These settings help optimize how your DEX appears in search engines and when shared on social media platforms like Twitter, Facebook, and Discord.",
  "seoConfigSection.siteNameDesc":
    "Site Name & Description: Improve search engine visibility",
  "seoConfigSection.siteUrlDesc":
    "Site URL: Automatically derived from your custom domain or repository URL",
  "seoConfigSection.twitterHandleDesc":
    "Twitter Handle: Credits your account in Twitter shares",
  "seoConfigSection.themeColorDesc":
    "Theme Color: Customizes mobile browser appearance",
  "seoConfigSection.keywordsDesc":
    "Keywords: Help search engines understand your content",
  "seoConfigSection.siteName": "Site Name",
  "seoConfigSection.siteNamePlaceholder": "My DEX Platform",
  "seoConfigSection.siteNameHelp":
    "The name of your DEX shown in browser titles and social media sharing",
  "seoConfigSection.siteDescription": "Site Description",
  "seoConfigSection.siteDescriptionPlaceholder":
    "A powerful decentralized exchange for seamless trading",
  "seoConfigSection.siteDescriptionHelp":
    "A brief description of your DEX shown in search results and social media",
  "seoConfigSection.siteLanguage": "Site Language",
  "seoConfigSection.siteLanguagePlaceholder": "en",
  "seoConfigSection.siteLanguageHelp":
    "Language code: 'en', 'es', 'zh' or with region 'en-US', 'es-MX', 'zh-CN'",
  "seoConfigSection.siteLanguageFormat":
    "Format: 'en' or 'en-US' (2 lowercase letters, optionally hyphen + 2 uppercase letters)",
  "seoConfigSection.siteLocale": "Site Locale",
  "seoConfigSection.siteLocalePlaceholder": "en_US",
  "seoConfigSection.siteLocaleHelp":
    "Locale for social platforms (e.g., 'en_US', 'zh_CN')",
  "seoConfigSection.siteLocaleFormat":
    "Format: 'en_US' (2 lowercase letters, underscore, 2 uppercase letters)",
  "seoConfigSection.twitterHandle": "Twitter Handle",
  "seoConfigSection.twitterHandleHelp":
    "Your Twitter handle for Twitter Card metadata (must start with @)",
  "seoConfigSection.twitterHandleFormat":
    "Must start with @ and contain only alphanumeric characters and underscores",
  "seoConfigSection.themeColor": "Theme Color",
  "seoConfigSection.themeColorPlaceholder": "#1a1b23",
  "seoConfigSection.themeColorHelp":
    "Hex color for mobile browser theme (e.g., #1a1b23)",
  "seoConfigSection.clearThemeColor": "Clear theme color",
  "seoConfigSection.clear": "Clear",
  "seoConfigSection.keywords": "Keywords",
  "seoConfigSection.keywordsPlaceholder": "dex, crypto, trading, defi, orderly",
  "seoConfigSection.keywordsHelp":
    "Comma-separated keywords for search engines (max 500 characters)",

  // ThemeColorSwatches
  "themeColorSwatches.primaryColors": "Primary Colors",
  "themeColorSwatches.statusColors": "Status Colors",
  "themeColorSwatches.baseColors": "Base Colors",
  "themeColorSwatches.tradingColors": "Trading Colors",
  "themeColorSwatches.fillColors": "Fill Colors",
  "themeColorSwatches.lineColors": "Line Colors",
  "themeColorSwatches.otherColors": "Other Colors",
  "themeColorSwatches.brandGradient": "Brand Gradient",
  "themeColorSwatches.syncWithPrimary": "Sync with primary",
  "themeColorSwatches.clickToEditColor":
    "Click to edit {{displayName}} Color, use checkbox to select",
  "themeColorSwatches.clickToSetColor": "Click to set {{displayName}} Color",
  "themeColorSwatches.invalidCssFormat":
    "Invalid CSS format for {{displayName}}",
  "themeColorSwatches.rgbValue": "RGB({{rgbValue}})",
  "themeColorSwatches.notSet": "Not set",
  "themeColorSwatches.invalidFormat": "Invalid format",
  "themeColorSwatches.invalidGradientFormat": "Invalid gradient format",
  "themeColorSwatches.brandGradientUsedFor":
    "Brand gradient is used for primary buttons and important UI elements",

  // PnLPostersSection
  "pnlPostersSection.title": "PnL Sharing Backgrounds",
  "pnlPostersSection.optional": "optional",
  "pnlPostersSection.description":
    "Custom background images for PnL sharing feature. Users can choose from these when sharing their trading results.",
  "pnlPostersSection.addPoster": "Add Poster",
  "pnlPostersSection.noPostersYet": "No PnL poster backgrounds added yet.",
  "pnlPostersSection.addFirstPoster": "Add First Poster",
  "pnlPostersSection.poster": "Poster",
  "pnlPostersSection.aboutPnLPosters": "About PnL Posters",
  "pnlPostersSection.aboutPnLPostersDesc":
    "These custom background images will be available to users when sharing their trading PnL (Profit and Loss) results on social media.",
  "pnlPostersSection.designGuidelines": "Design Guidelines",
  "pnlPostersSection.darkBackgroundArea":
    "Dark Background Area: Include a dark section on the left side (about 40% of width) for text overlay",
  "pnlPostersSection.textReadability":
    "Text Readability: The dark area ensures white/light text remains readable when trading data is overlaid",
  "pnlPostersSection.visualBalance":
    "Visual Balance: Right side can feature your branding, illustrations, or decorative elements",
  "pnlPostersSection.format":
    "Format: 16:9 aspect ratio (960x540px recommended) for optimal display",
  "pnlPostersSection.remove": "Remove",
  "pnlPostersSection.helpTextAspectRatio":
    "16:9 aspect ratio (960x540px). Include a dark area on the left side for text readability.",
  "pnlPostersSection.addAnotherPoster": "Add Another Poster ({{count}}/8)",
  "pnlPostersSection.customBackgroundsNote":
    "You can add up to 8 custom backgrounds. If none are provided, default backgrounds will be used.",
  "pnlPostersSection.hide": "Hide",
  "pnlPostersSection.preview": "Preview",
  "pnlPostersSection.pnlSharing": "PnL Sharing",
  "pnlPostersSection.previewWidgetDescription":
    "Preview of PnL sharing widget with your custom backgrounds:",

  // TradingViewColorConfig
  "tradingViewColorConfig.title": "TradingView Chart Colors",
  "tradingViewColorConfig.description":
    "Customize the colors used in TradingView charts",
  "tradingViewColorConfig.candleUpColor": "Candle Up Color",
  "tradingViewColorConfig.candleDownColor": "Candle Down Color",
  "tradingViewColorConfig.pnlProfitColor": "PnL Profit Color",
  "tradingViewColorConfig.pnlLossColor": "PnL Loss Color",
  "tradingViewColorConfig.chartBackground": "Chart Background",
  "tradingViewColorConfig.candleUpDesc":
    "Color for bullish/rising price candles",
  "tradingViewColorConfig.candleDownDesc":
    "Color for bearish/falling price candles",
  "tradingViewColorConfig.pnlProfitDesc": "Color for positive PnL values",
  "tradingViewColorConfig.pnlLossDesc": "Color for negative PnL values",
  "tradingViewColorConfig.chartBgDesc": "Background color of the chart area",
  "tradingViewColorConfig.importantNotes": "Important Notes",
  "tradingViewColorConfig.importantNotesDesc":
    "Colors will not appear in the DEX preview mode",
  "tradingViewColorConfig.clearStorageNote":
    "After deployment, you may need to clear browser local storage to see color changes",
  "tradingViewColorConfig.disableForDefault":
    "Disable this feature to use TradingView's default theme colors",
  "tradingViewColorConfig.chartBg": "Chart BG",
  "tradingViewColorConfig.enabled": "Enabled",
  "tradingViewColorConfig.disabled": "Disabled",
  "tradingViewColorConfig.overrideDefault":
    "These colors will override TradingView's default chart colors",
  "tradingViewColorConfig.savedConfigDisabled":
    "Previously saved TradingView color configuration (currently disabled)",
  "tradingViewColorConfig.customColorsDisabled":
    "Custom colors are disabled. Enable above to apply these colors.",
  "tradingViewColorConfig.preview": "Preview",
  "tradingViewColorConfig.bullish": "Bullish",
  "tradingViewColorConfig.bearish": "Bearish",

  // ThemePresetPreviewModal
  "themePresetPreviewModal.selectThemePreset": "Select Theme Preset",
  "themePresetPreviewModal.cancel": "Cancel",
  "themePresetPreviewModal.applyPreset": "Apply Preset",
  "themePresetPreviewModal.applyThemePresetTitle": "Apply Theme Preset",
  "themePresetPreviewModal.applyThemePresetDesc":
    "Applying this preset will <0>overwrite all your current theme customizations</0>, including",
  "themePresetPreviewModal.allColorCustomizations": "All color customizations",
  "themePresetPreviewModal.fontSettings": "Font settings",
  "themePresetPreviewModal.borderRadiusAdjustments":
    "Border radius adjustments",
  "themePresetPreviewModal.spacingModifications": "Spacing modifications",
  "themePresetPreviewModal.aiFineTuneOverrides": "Any AI fine-tune overrides",
  "themePresetPreviewModal.actionCannotBeUndone":
    "This action cannot be undone. Are you sure you want to continue?",
  "themePresetPreviewModal.yesApplyPreset": "Yes, Apply Preset",

  // ThemePreviewModal
  "themePreviewModal.previewThemeChanges": "Preview Theme Changes",
  "themePreviewModal.old": "Old",
  "themePreviewModal.cancel": "Cancel",
  "themePreviewModal.selectVariant": "Select a Variant",
  "themePreviewModal.acceptTheme": "Accept Theme",
  "themePreviewModal.themePreview": "Theme Preview",
  "themePreviewModal.aiGeneratedTheme": "AI-Generated Theme",
  "themePreviewModal.aiGeneratedThemeDesc":
    "This theme was created by an AI based on your description. While we strive for quality results:",
  "themePreviewModal.colorsMayNotMatch":
    "Colors may not always perfectly match your description",
  "themePreviewModal.contrastMayNeedAdjustments":
    "Contrast ratios between elements might need adjustment",
  "themePreviewModal.combinationsMayNotLookIdeal":
    "Some color combinations might not look ideal in all contexts",
  "themePreviewModal.recommendation": "Recommendation",
  "themePreviewModal.recommendationDesc":
    "Use the preview functionality to see how your theme looks in a real DEX environment, and make adjustments as needed using the color editor below.",
  "themePreviewModal.applyTheme": "Apply Theme",

  // TokenSelectionModal
  "tokenSelectionModal.loading": "Loading...",
  "tokenSelectionModal.save25Percent": "Save 25% (~${{amount}})",
  "tokenSelectionModal.usdCoinOnChain": "USD Coin on {{chainName}}",
  "tokenSelectionModal.orderTokenOnChain": "Order Token on {{chainName}}",
  "tokenSelectionModal.selectToken": "Select a token",
  "tokenSelectionModal.selected": "Selected",
  "tokenSelectionModal.graduation": "Graduation",

  // DexCreationStatus
  "dexCreationStatus.title": "DEX Creation Status",
  "dexCreationStatus.intro":
    "We've created the source code for your DEX! Here's what's happening now:",
  "dexCreationStatus.step1Title": "Step 1: Source Code Created",
  "dexCreationStatus.step1Desc":
    "We've created a GitHub repository containing all the code needed for your DEX. Think of this as the blueprint for your exchange:",
  "dexCreationStatus.repoNote":
    "You don't need to do anything with this link unless you're a developer",
  "dexCreationStatus.step2Live": "Step 2: Your DEX is Live!",
  "dexCreationStatus.congratulations":
    "Congratulations! Your DEX website is fully built and ready to use. Your users can access it at:",
  "dexCreationStatus.customDomainNote":
    "Your DEX is using a custom domain. The standard deployment URL will no longer work correctly as the build is now optimized for your custom domain.",
  "dexCreationStatus.domainChangeNote":
    'Note: After changing any custom domain settings, you must wait for a deployment to complete (check "Updates & Deployment Status" below) for domain changes to take effect.',
  "dexCreationStatus.makingChanges": "Making Changes to Your DEX",
  "dexCreationStatus.changesDesc":
    "When you update any information above (like your broker name, logos, or social links):",
  "dexCreationStatus.changesSaved":
    "Your changes are first saved to our system",
  "dexCreationStatus.workflowRuns":
    "An automatic update process (workflow) runs to rebuild your DEX",
  "dexCreationStatus.changesLive":
    "Once complete, your changes will appear live on your DEX website",
  "dexCreationStatus.takes2to5Minutes":
    "This process typically takes 2-5 minutes",
  "dexCreationStatus.trackProgress":
    'You can track the progress of your updates in the "Deployment Progress" section above',
  "dexCreationStatus.step2Building": "Step 2: Building Your DEX Website",
  "dexCreationStatus.buildingDesc":
    "We're currently building your DEX website from the source code. This process usually takes 2-5 minutes to complete.",
  "dexCreationStatus.seeLinkWhenComplete":
    "Once complete, you'll see a link to your live DEX here.",
  "dexCreationStatus.aboutFutureUpdates": "About Future Updates",
  "dexCreationStatus.futureUpdatesDesc":
    "Whenever you make changes to your DEX (updating logos, social links, etc.), this same build process will run again. Your changes will be live after the process completes, which typically takes 2-5 minutes.",
  "dexCreationStatus.updatesDeploymentStatus": "Updates & Deployment Status",
  "dexCreationStatus.statusDesc":
    'This shows the current status of your DEX updates. When the latest run shows "completed", your changes are live on your DEX website:',
  "dexCreationStatus.repoErrorNote":
    "<0>⚠️ Note:</0> Your DEX configuration was saved, but we couldn't create your repository.",
  "dexCreationStatus.retryNote": "You can retry the repository creation now.",
  "dexCreationStatus.retrying": "Retrying...",
  "dexCreationStatus.retryRepoCreation": "Retry Repository Creation",
  "dexCreationStatus.deployWorkflowName": "Deploy to GitHub Pages",

  // DexSectionRenderer (DEX_SECTIONS config)
  "dexSectionRenderer.distributorCode.title":
    "Are you invited by any distributor? ",
  "dexSectionRenderer.distributorCode.label": "Distributor code",
  "dexSectionRenderer.distributorCode.description":
    "If you have been referred by a distributor and given a distributor code, please input below for binding.",
  "dexSectionRenderer.brokerDetails.title": "Broker Details",
  "dexSectionRenderer.brokerDetails.description":
    "Configure your DEX's basic information and trading broker details. Broker name can only contain letters, numbers, spaces, dots, hyphens, and underscores.",
  "dexSectionRenderer.branding.title": "Branding",
  "dexSectionRenderer.branding.description":
    "Customize your DEX with your own branding by pasting your logos below. Copy an image to your clipboard (from any image editor or browser), then click in the paste area and press Ctrl+V or ⌘+V. All branding fields are optional.",
  "dexSectionRenderer.themeCustomization.title": "Theme Customization",
  "dexSectionRenderer.themeCustomization.description":
    "Customize your DEX's colors and theme by editing the CSS directly or describing how you want it to look for AI-assisted generation. Theme customization is completely optional - your DEX will work great with the default theme.",
  "dexSectionRenderer.pnlPosters.title": "PnL Posters",
  "dexSectionRenderer.pnlPosters.description":
    "Upload custom background images for PnL sharing posters. Users can share their trading performance with these backgrounds. You can upload up to 8 custom poster backgrounds. Leave empty to use default poster designs.",
  "dexSectionRenderer.socialLinks.title": "Social Media Links",
  "dexSectionRenderer.socialLinks.description":
    "Add social media links that will appear in your DEX footer. All social media links are optional. Leave empty if not applicable.",
  "dexSectionRenderer.seoConfiguration.title": "SEO Configuration",
  "dexSectionRenderer.seoConfiguration.description":
    "Configure SEO settings to optimize how your DEX appears in search engines and social media sharing. All SEO fields are optional but recommended for better discoverability.",
  "dexSectionRenderer.analyticsConfiguration.title": "Analytics Configuration",
  "dexSectionRenderer.analyticsConfiguration.description":
    "Add your analytics tracking script to monitor usage and performance of your DEX. Supports Google Analytics, Plausible, Matomo, and other analytics services. This is completely optional.",
  "dexSectionRenderer.reownConfiguration.title": "Reown Configuration",
  "dexSectionRenderer.reownConfiguration.description":
    "Add your Reown Project ID to enable enhanced wallet connectivity functionality in your DEX. This is completely optional - your DEX will work without it.",
  "dexSectionRenderer.privyConfiguration.title": "Privy Configuration",
  "dexSectionRenderer.privyConfiguration.description":
    "Add your Privy credentials to enable social login, email authentication, and other wallet connection options in your DEX. This is completely optional. Only the App ID is required if you want to use Privy.",
  "dexSectionRenderer.blockchainConfiguration.title":
    "Blockchain Configuration",
  "dexSectionRenderer.blockchainConfiguration.description":
    "Choose which blockchains your DEX will support for trading. This is optional - your DEX will support all available blockchains by default.",
  "dexSectionRenderer.assetFilter.title": "Asset Filtering",
  "dexSectionRenderer.assetFilter.description":
    "Select which trading pairs will be displayed in your DEX. Leave empty to show all available assets. This is optional - your DEX will show all assets by default.",
  "dexSectionRenderer.languageSupport.title": "Language Support",
  "dexSectionRenderer.languageSupport.description":
    "Select the languages you want to support in your DEX interface. This is optional - your DEX will default to English only.",
  "dexSectionRenderer.navigationMenus.title": "Navigation Menus",
  "dexSectionRenderer.navigationMenus.description":
    "Customize which navigation links appear in your DEX. This is optional - if you don't select any menus, the default menus will be displayed.",
  "dexSectionRenderer.serviceDisclaimer.title": "Service Disclaimer",
  "dexSectionRenderer.serviceDisclaimer.description":
    "Enable a one-time disclaimer dialog that informs users about the platform's use of Orderly Network's infrastructure. This is optional and can help set proper expectations for users.",
  "dexSectionRenderer.serviceRestrictions.title": "Service Restrictions",
  "dexSectionRenderer.serviceRestrictions.description":
    "Configure geo-restrictions to limit access to your DEX by region.",
  "dexSectionRenderer.optional": "optional",

  // DexSetupAssistant
  "dexSetupAssistant.title": "Create Your DEX - Step-by-Step",
  "dexSetupAssistant.pleaseInputDistributorCode":
    "Please input distributor code.",
  "dexSetupAssistant.distributorCodeInvalid":
    "Distributor code is invalid. It must be between 4 and 10 characters.",
  "dexSetupAssistant.brokerNameInvalid":
    "Broker name is invalid. It must be between 3 and 50 characters.",
  "dexSetupAssistant.privyTermsInvalid":
    "Privy Terms of Use URL is not a valid URL.",
  "dexSetupAssistant.creatingDex": "Creating DEX and forking repository...",
  "dexSetupAssistant.quickSetupForking":
    "Creating DEX with current settings...",
  "dexSetupAssistant.quickSetupSuccessWithRepo":
    "DEX created with current settings! Repository is being set up.",
  "dexSetupAssistant.quickSetupSuccessWithoutRepo":
    "DEX created with current settings!",
  "dexSetupAssistant.successWithRepo":
    "DEX created and repository forked successfully!",
  "dexSetupAssistant.successWithoutRepo": "DEX information saved successfully!",
  "dexSetupAssistant.repoCouldNotFork":
    "Repository could not be forked. You can retry later.",
  "dexSetupAssistant.failedToCreate": "Failed to create DEX. Please try again.",
  "dexSetupAssistant.settingUpDex":
    "This may take a moment. We're setting up your DEX repository and configuring it with your information.",
  "dexSetupAssistant.quickSetup": "Quick Setup",
  "dexSetupAssistant.quickSetupDesc":
    "Create your DEX with current settings. You can customize it later.",
  "dexSetupAssistant.creatingDexShort": "Creating DEX...",
  "dexSetupAssistant.createDexNow": "Create DEX Now",
  "dexSetupAssistant.createYourDex": "Create Your DEX",
  "dexSetupAssistant.allStepsCompleted": "All steps completed!",
  "dexSetupAssistant.readyToCreate":
    'You\'re ready to create your DEX. Click the "Create Your DEX" button above to proceed.',
  "dexSetupAssistant.invitedByDistributor":
    "You have been invited by the following distributor.",
  "dexSetupAssistant.navMenusSwapFeeRequired":
    "Navigation Menus: Swap fee configuration is required when Swap page is enabled",

  // DexUpgrade
  "dexUpgrade.title": "DEX Upgrade Available",
  "dexUpgrade.new": "New",
  "dexUpgrade.desc":
    "New features and improvements are ready for your DEX. Click upgrade to get the latest updates.",
  "dexUpgrade.whatsNew": "What's new",
  "dexUpgrade.upgrading": "Upgrading...",
  "dexUpgrade.upgradeDex": "Upgrade DEX",
  "dexUpgrade.successToast":
    "DEX upgraded successfully! New features are being deployed.",
  "dexUpgrade.failedToast": "Failed to upgrade DEX. Please try again.",
  "dexUpgrade.noDexData": "No DEX data available",

  // DistributorCodeSection
  "distributorCodeSection.yourDistributor": "Your distributor",
  "distributorCodeSection.distributorCode": "Distributor code",
  "distributorCodeSection.helpText":
    "Alphanumeric characters only. Other special characters and spaces are not permitted.",
  "distributorCodeSection.placeholder": "Distributor code",

  // DomainSetupGuideModal
  "domainSetupGuideModal.title": "Domain Purchase & Setup Guide",
  "domainSetupGuideModal.subtitle":
    "Step-by-step instructions for purchasing and configuring your custom domain",
  "domainSetupGuideModal.chooseProvider": "Choose Your Provider",
  "domainSetupGuideModal.cloudflare": "CloudFlare",
  "domainSetupGuideModal.cloudflareDesc":
    "Integrated DNS management, competitive pricing, fast setup",
  "domainSetupGuideModal.namecheap": "Namecheap",
  "domainSetupGuideModal.namecheapDesc":
    "Affordable domains, excellent support, user-friendly interface",
  "domainSetupGuideModal.steps": "Steps",
  "domainSetupGuideModal.step": "Step",
  "domainSetupGuideModal.previous": "Previous",
  "domainSetupGuideModal.next": "Next",
  "domainSetupGuideModal.completeGuide": "Complete Guide",
  "domainSetupGuideModal.requiredDnsRecords": "Required DNS Records",
  "domainSetupGuideModal.requiredDnsRecordsFor":
    "Required DNS Records for {{domain}}",
  "domainSetupGuideModal.stepIllustration": "Step illustration",
  "domainSetupGuideModal.imagePlaceholder":
    "Image will be added here (16:9 aspect ratio)",
  "domainSetupGuideModal.cloudflare.step1.title": "Create CloudFlare Account",
  "domainSetupGuideModal.cloudflare.step1.description":
    "Visit the CloudFlare signup page to create a new account. Use your email address and create a strong password.",
  "domainSetupGuideModal.cloudflare.step1.imageAlt": "CloudFlare sign up page",
  "domainSetupGuideModal.cloudflare.step1.linkText": "CloudFlare Sign Up",
  "domainSetupGuideModal.cloudflare.step2.title": "Search and Select Domain",
  "domainSetupGuideModal.cloudflare.step2.description":
    "Visit the CloudFlare registrar to search for your desired domain name. Choose your domain and TLD, review pricing, and select registration period.",
  "domainSetupGuideModal.cloudflare.step2.imageAlt":
    "Domain search and selection",
  "domainSetupGuideModal.cloudflare.step2.linkText":
    "CloudFlare Domain Registration",
  "domainSetupGuideModal.cloudflare.step3.title":
    "Complete Registration and Payment",
  "domainSetupGuideModal.cloudflare.step3.description":
    "Fill in your contact information, complete the registration form, and proceed to payment. CloudFlare accepts major credit cards and PayPal.",
  "domainSetupGuideModal.cloudflare.step3.imageAlt":
    "Domain registration and payment",
  "domainSetupGuideModal.cloudflare.step4.title": "Access DNS Management",
  "domainSetupGuideModal.cloudflare.step4.description":
    "After purchase, your domain will appear in your CloudFlare dashboard. Click on your domain, then select 'DNS' > 'Records' in the sidebar to access DNS management.",
  "domainSetupGuideModal.cloudflare.step4.imageAlt":
    "CloudFlare DNS management navigation",
  "domainSetupGuideModal.cloudflare.step4.linkText": "CloudFlare Dashboard",
  "domainSetupGuideModal.cloudflare.step5.title": "Configure DNS Records",
  "domainSetupGuideModal.cloudflare.step5.description":
    "In the DNS tab, add the required A records and CNAME record. Most importantly, ensure the 'Proxy status' (orange cloud icon) is enabled for all records. This provides instant SSL/TLS encryption and better performance than waiting for GitHub Pages certificates.",
  "domainSetupGuideModal.cloudflare.step5.imageAlt":
    "DNS configuration interface in CloudFlare",
  "domainSetupGuideModal.cloudflare.step5.linkText":
    "CloudFlare DNS Management",
  "domainSetupGuideModal.namecheap.step1.title": "Create Namecheap Account",
  "domainSetupGuideModal.namecheap.step1.description":
    "Visit the Namecheap signup page to create a new account. You can also sign up using your Google or Facebook account for faster registration.",
  "domainSetupGuideModal.namecheap.step1.imageAlt": "Namecheap sign up page",
  "domainSetupGuideModal.namecheap.step1.linkText": "Namecheap Sign Up",
  "domainSetupGuideModal.namecheap.step2.title": "Search and Select Domain",
  "domainSetupGuideModal.namecheap.step2.description":
    "Use the domain search bar to find your desired domain name. Choose your domain and TLD, review pricing, and add to cart.",
  "domainSetupGuideModal.namecheap.step2.imageAlt":
    "Namecheap domain search and selection",
  "domainSetupGuideModal.namecheap.step2.linkText": "Namecheap Homepage",
  "domainSetupGuideModal.namecheap.step3.title":
    "Configure Settings and Complete Purchase",
  "domainSetupGuideModal.namecheap.step3.description":
    "Configure additional services like WHOIS privacy protection, auto-renewal, and domain locking. Fill in your contact information, complete the registration form, and proceed to payment.",
  "domainSetupGuideModal.namecheap.step3.imageAlt":
    "Domain configuration and payment",
  "domainSetupGuideModal.namecheap.step4.title": "Access Domain Management",
  "domainSetupGuideModal.namecheap.step4.description":
    "Log into your Namecheap account and go to 'Domain List'. Click 'Manage' next to your domain to access DNS settings, contact information, and other domain management options.",
  "domainSetupGuideModal.namecheap.step4.imageAlt":
    "Namecheap domain management dashboard",
  "domainSetupGuideModal.namecheap.step4.linkText":
    "Namecheap Domain Management",
  "domainSetupGuideModal.namecheap.step5.title": "Configure DNS Records",
  "domainSetupGuideModal.namecheap.step5.description":
    "In the 'Advanced DNS' tab, first remove the default DNS setup (one redirect and a CNAME www record). Then add the required A records and CNAME record for your DEX.",
  "domainSetupGuideModal.namecheap.step5.imageAlt":
    "Namecheap DNS management interface",
  "domainSetupGuideModal.namecheap.step5.linkText": "Namecheap DNS Management",
  "domainSetupGuideModal.cloudflareProxyTitle":
    "CloudFlare Proxy Setup (Important!)",
  "domainSetupGuideModal.cloudflareProxyEnableAll":
    "Enable the orange cloud icon (Proxy status) for ALL records",
  "domainSetupGuideModal.cloudflareProxyEnableCname":
    "Enable the orange cloud icon (Proxy status) for the CNAME record",
  "domainSetupGuideModal.cloudflareProxyInstantSsl":
    "This provides instant SSL/TLS encryption",
  "domainSetupGuideModal.cloudflareProxyFaster":
    "Much faster than waiting for GitHub Pages certificates",
  "domainSetupGuideModal.cloudflareProxyBetter":
    "Better performance and security",
  "domainSetupGuideModal.recommendedEmailSecurity":
    "Recommended: Email Security Records",
  "domainSetupGuideModal.emailSecurityDesc":
    "Add these TXT records to protect your domain from email spoofing attacks. Without these, attackers could send phishing emails appearing to come from your domain, which may cause your site to be flagged by Google Safe Browsing.",
  "domainSetupGuideModal.spfRecord": "SPF Record:",
  "domainSetupGuideModal.dmarcRecord": "DMARC Record:",
  "domainSetupGuideModal.recordsTellServers":
    "These records tell email servers that your domain doesn't send emails and to reject any emails claiming to be from your domain.",
  "domainSetupGuideModal.copyExactValues":
    "Copy these exact values to your DNS provider. Changes may take up to 24 hours to propagate.",

  // EditModeModal
  "editModeModal.desktopPreview": "Desktop Preview",
  "editModeModal.mobilePreview": "Mobile Preview",
  "editModeModal.holdCtrlToInspect":
    "Hold <0>Ctrl</0> + Click to inspect CSS variables",
  "editModeModal.presets": "Presets",
  "editModeModal.theme": "Theme",
  "editModeModal.ai": "AI",
  "editModeModal.close": "Close",

  // FeeConfigWithCalculator
  "feeConfigWithCalculator.feeConfiguration": "Fee Configuration",
  "feeConfigWithCalculator.hide": "Hide",
  "feeConfigWithCalculator.configure": "Configure",
  "feeConfigWithCalculator.feeConfigDesc":
    "Configure the trading fees for your DEX. Maker fees apply to limit orders that provide liquidity, while taker fees apply to market orders that take liquidity.",
  "feeConfigWithCalculator.importantFeeNote": "Important Fee Note:",
  "feeConfigWithCalculator.importantFeeNoteBlock":
    "<0>Important Fee Note:</0> The fees you configure here are the <1>total fees</1> that traders will pay. This includes the Orderly base fee (varies by tier - see calculator below). Your revenue will be: <2>Your Custom Fee - Orderly Base Fee</2>.",
  "feeConfigWithCalculator.feeNoteDesc":
    "The fees you configure here are the total fees that traders will pay. This includes the Orderly base fee (varies by tier - see calculator below). Your revenue will be: Your Custom Fee - Orderly Base Fee.",
  "feeConfigWithCalculator.makerFeeLabel": "Maker Fee",
  "feeConfigWithCalculator.takerFeeLabel": "Taker Fee",
  "feeConfigWithCalculator.rwaAssetFees": "RWA Asset Fees",
  "feeConfigWithCalculator.rwaAssetFeesDesc":
    "Configure separate fees for Real World Asset (RWA) trading.",
  "feeConfigWithCalculator.rwaMakerFeeLabel": "RWA Maker Fee",
  "feeConfigWithCalculator.rwaTakerFeeLabel": "RWA Taker Fee",
  "feeConfigWithCalculator.percentUnit": "(0.01%)",
  "feeConfigWithCalculator.feeRange":
    "Minimum: {{min}} {{unit}} ({{minPercent}}%), Maximum: {{max}} {{unit}} ({{maxPercent}}%)",
  "feeConfigWithCalculator.correctErrors":
    "Please correct the errors before saving",
  "feeConfigWithCalculator.feeValuesOutsideRange":
    "Fee values are outside of allowed range",
  "feeConfigWithCalculator.orderlyKeyRequired":
    "Orderly key required to update fees",
  "feeConfigWithCalculator.feesUpdatedSuccess": "Fees updated successfully!",
  "feeConfigWithCalculator.failedToUpdateFees": "Failed to update fees",
  "feeConfigWithCalculator.orderlyKeyRequiredTitle": "Orderly Key Required",
  "feeConfigWithCalculator.orderlyKeyRequiredDesc":
    "To update fees directly via Orderly API, you need to create an Orderly key first.",
  "feeConfigWithCalculator.createOrderlyKey": "Create Orderly Key",
  "feeConfigWithCalculator.saveFeeConfiguration": "Save Fee Configuration",
  "feeConfigWithCalculator.saving": "Saving...",
  "feeConfigWithCalculator.currentFeeStructure": "Current Fee Structure",
  "feeConfigWithCalculator.currentFeeStructureColon": "Current Fee Structure:",
  "feeConfigWithCalculator.standardFees": "Standard Fees",
  "feeConfigWithCalculator.makerFee": "Maker Fee",
  "feeConfigWithCalculator.takerFee": "Taker Fee",
  "feeConfigWithCalculator.rwaMakerFee": "RWA Maker Fee",
  "feeConfigWithCalculator.rwaTakerFee": "RWA Taker Fee",
  "feeConfigWithCalculator.noteTotalFees":
    "Note: These are the total fees that traders will pay on your DEX. The Orderly base fee varies by tier (Public: 3.00 bps taker, Diamond: 1.00 bps taker). Your revenue = Your Custom Fee - Base Fee. Improve your tier through the Builder Staking Programme to reduce the base fee and increase your revenue.",
  "feeConfigWithCalculator.noteTotalFeesTrans":
    "<0>Note:</0> These are the total fees that traders will pay on your DEX. The Orderly base fee varies by tier (Public: 3.00 bps taker, Diamond: 1.00 bps taker). Your revenue = Your Custom Fee - Base Fee. Improve your tier through the <1>Builder Staking Programme</1> to reduce the base fee and increase your revenue.",
  "feeConfigWithCalculator.revenueCalculator": "Revenue Calculator",
  "feeConfigWithCalculator.hideCalculator": "Hide Calculator",
  "feeConfigWithCalculator.showCalculator": "Show Calculator",
  "feeConfigWithCalculator.estimateRevenueDesc":
    "Estimate your potential monthly revenue based on trading volume and your current fee configuration.",
  "feeConfigWithCalculator.monthlyVolume": "Monthly Trading Volume (USD)",
  "feeConfigWithCalculator.enterVolume":
    "Enter your expected monthly trading volume",
  "feeConfigWithCalculator.builderStakingTier": "Builder Staking Tier",
  "feeConfigWithCalculator.estimatedRevenue":
    "Estimated Monthly Revenue (After Base Fee Deduction)",
  "feeConfigWithCalculator.makerRevenue": "Maker Revenue",
  "feeConfigWithCalculator.takerRevenue": "Taker Revenue",
  "feeConfigWithCalculator.totalRevenue": "Total Revenue",
  "feeConfigWithCalculator.perMonth": "per month",
  "feeConfigWithCalculator.afterBaseFee": "after base fee",
  "feeConfigWithCalculator.calculationNote":
    "This calculation assumes an equal split between maker and taker volume. Actual revenue may vary based on market conditions, trading patterns, and fee changes. Revenue shown represents your earnings after the Orderly base fee ({{makerBps}} bps maker, {{takerBps}} bps taker for {{tierName}} tier) is deducted from your custom fees.",
  "feeConfigWithCalculator.settingCompetitiveFees":
    "Setting competitive fees can attract more traders to your DEX. The fee split you receive will be based on the fees your traders pay.",
  "feeConfigWithCalculator.oneDecimalPlace":
    "Please enter only one decimal place (e.g., 3.5)",
  "feeConfigWithCalculator.oneDecimalPlace65":
    "Please enter only one decimal place (e.g., 6.5)",
  "feeConfigWithCalculator.oneDecimalPlace50":
    "Please enter only one decimal place (e.g., 5.0)",
  "feeConfigWithCalculator.makerFeeMin": "Maker fee must be at least {{min}}",
  "feeConfigWithCalculator.makerFeeMax": "Maker fee cannot exceed {{max}}",
  "feeConfigWithCalculator.takerFeeMin": "Taker fee must be at least {{min}}",
  "feeConfigWithCalculator.takerFeeMax": "Taker fee cannot exceed {{max}}",
  "feeConfigWithCalculator.rwaMakerFeeMin":
    "RWA Maker fee must be at least {{min}}",
  "feeConfigWithCalculator.rwaMakerFeeMax":
    "RWA Maker fee cannot exceed {{max}}",
  "feeConfigWithCalculator.rwaTakerFeeMin":
    "RWA Taker fee must be at least {{min}}",
  "feeConfigWithCalculator.rwaTakerFeeMax":
    "RWA Taker fee cannot exceed {{max}}",
  "feeConfigWithCalculator.tier.public": "Public",
  "feeConfigWithCalculator.tier.publicRequirement": "No requirement",
  "feeConfigWithCalculator.tier.silver": "Silver",
  "feeConfigWithCalculator.tier.silverRequirement":
    "100K $ORDER or ≥$30M volume",
  "feeConfigWithCalculator.tier.gold": "Gold",
  "feeConfigWithCalculator.tier.goldRequirement": "250K $ORDER or ≥$90M volume",
  "feeConfigWithCalculator.tier.platinum": "Platinum",
  "feeConfigWithCalculator.tier.platinumRequirement":
    "2M $ORDER or ≥$1B volume",
  "feeConfigWithCalculator.tier.diamond": "Diamond",
  "feeConfigWithCalculator.tier.diamondRequirement":
    "7M $ORDER or ≥$10B volume",

  // FeeWithdrawalModal
  "feeWithdrawalModal.title": "Withdraw Fees",
  "feeWithdrawalModal.multisigProcess": "Multisig Withdrawal Process",
  "feeWithdrawalModal.multisigDesc":
    "This will withdraw fees to your multisig wallet. The operation requires a signature from your connected EOA wallet.",
  "feeWithdrawalModal.withdrawalAddress": "Withdrawal Address (Multisig)",
  "feeWithdrawalModal.amountUsdc": "Amount (USDC)",
  "feeWithdrawalModal.loadingBalance": "Loading balance...",
  "feeWithdrawalModal.available": "Available",
  "feeWithdrawalModal.max": "MAX",
  "feeWithdrawalModal.wrongNetwork": "Wrong Network",
  "feeWithdrawalModal.switchNetworkDesc":
    "Please switch to {{chainName}} where your multisig delegate signer link was established.",
  "feeWithdrawalModal.withdrawFees": "Withdraw Fees",
  "feeWithdrawalModal.processing": "Processing...",
  "feeWithdrawalModal.switchToNetwork": "Switch to {{chainName}}",
  "feeWithdrawalModal.switchToCorrectNetwork": "Switch to Correct Network",
  "feeWithdrawalModal.noOrderlyKey":
    "No Orderly key found. Please create one first.",
  "feeWithdrawalModal.switchToRequiredNetwork":
    "Please switch to the required network in your wallet",
  "feeWithdrawalModal.missingData": "Missing required data for withdrawal",
  "feeWithdrawalModal.pleaseSwitchToWithdraw":
    "Please switch to {{chainName}} to withdraw",
  "feeWithdrawalModal.enterValidAmount": "Please enter valid amount",
  "feeWithdrawalModal.withdrawalSuccess":
    "Withdrawal request submitted successfully!",
  "feeWithdrawalModal.withdrawalFailed": "Failed to withdraw",

  // Form
  "form.submitting": "Submitting",
  "form.pleaseWait": "Please Wait",
  "form.rateLimitMessage": "You can only update your DEX once every 2 minutes.",
  "form.timeRemaining": "Time remaining",
  "form.waitTime": "Wait {{time}}",

  // FormInput
  "formInput.field": "Field",
  "formInput.required": "{{label}} is required",
  "formInput.minLength": "{{label}} must be at least {{minLength}} characters",
  "formInput.maxLength": "{{label}} cannot exceed {{maxLength}} characters",
  "formInput.invalidFormat": "{{label}} format is invalid",

  // FuzzySearchInput
  "fuzzySearchInput.placeholder": "Search...",

  // ImageCropModal
  "imageCropModal.title": "Crop Image",
  "imageCropModal.dragHint": "Drag to move, handles to resize",
  "imageCropModal.position": "Position",
  "imageCropModal.size": "Size",
  "imageCropModal.width": "Width",
  "imageCropModal.height": "Height",
  "imageCropModal.squareAspectRatioNote":
    "This image type requires a square aspect ratio",
  "imageCropModal.originalSize": "Original size",
  "imageCropModal.cropSize": "Crop size",
  "imageCropModal.finalOutputSize": "Final output size",
  "imageCropModal.maxSize": "Max size",
  "imageCropModal.cancel": "Cancel",
  "imageCropModal.applying": "Applying",
  "imageCropModal.applyCrop": "Apply Crop",

  // ImagePaste
  "imagePaste.failedToProcess": "Failed to process image. Please try again.",
  "imagePaste.noImageDataProvided": "No image data provided. Please try again.",
  "imagePaste.couldNotProcessInvalidImage":
    "Could not process image. Please ensure it's a valid image file.",
  "imagePaste.couldNotAccessClipboard":
    "Could not access clipboard. Please try using Ctrl+V or ⌘+V directly in the paste area.",
  "imagePaste.noImageInClipboard":
    "No image found in clipboard. Please copy an image first.",
  "imagePaste.couldNotReadSelectedFile":
    "Could not read the selected image file.",
  "imagePaste.failedToLoadSelectedImage":
    "Failed to load the selected image. Please try again.",
  "imagePaste.clear": "Clear",
  "imagePaste.processing": "Processing...",
  "imagePaste.dragDropPasteOr": "Drag & drop, paste, or",
  "imagePaste.selectFileLink": "select a file",
  "imagePaste.pasteImageButton": "Paste Image",
  "imagePaste.pasting": "Pasting...",
  "imagePaste.selectFileButton": "Select File",
  "imagePaste.selecting": "Selecting...",
  "imagePaste.recommendedSizeLabel": "Recommended size",
  "imagePaste.recommendedSizeDescription":
    "Images will be converted to WebP format. The final size will be your crop area size.",

  // InteractivePreview
  "interactivePreview.title": "Interactive Preview",
  "interactivePreview.description":
    'Click "Edit Desktop" or "Edit Mobile" to enter edit mode and customize CSS variables by clicking on elements.',
  "interactivePreview.desktopPreviewTitle": "Desktop Preview",
  "interactivePreview.desktopPreviewPlaceholderTitle": "Desktop preview",
  "interactivePreview.desktopPreviewPlaceholderDescription":
    'Click "Edit Desktop" to view',
  "interactivePreview.mobilePreviewTitle": "Mobile Preview",
  "interactivePreview.mobilePreviewPlaceholderTitle": "Mobile preview",
  "interactivePreview.mobilePreviewPlaceholderDescription":
    'Click "Edit Mobile" to view',
  "interactivePreview.editDesktop": "Edit Desktop",
  "interactivePreview.editMobile": "Edit Mobile",

  // GraduationExplanationModal
  "graduationExplanationModal.title": "Ready to Graduate Your DEX?",
  "graduationExplanationModal.whatIsGraduationTitle": "What is Graduation?",
  "graduationExplanationModal.whatIsGraduationDescription":
    "Graduation requires paying a fee in ORDER or USDC to unlock revenue-generating features for your DEX. Once graduated, your DEX becomes eligible to earn trading fees from users.",
  "graduationExplanationModal.earnRevenueTitle": "Earn Revenue",
  "graduationExplanationModal.earnRevenueDescription":
    "Get a split of trading fees generated by users on your DEX",
  "graduationExplanationModal.uniqueBrokerIdTitle": "Unique Broker ID",
  "graduationExplanationModal.uniqueBrokerIdDescription":
    "Get your own identifier in the Orderly ecosystem",
  "graduationExplanationModal.whyGraduateNowTitle": "Why Graduate Now?",
  "graduationExplanationModal.startEarningTitle": "Start Earning Immediately",
  "graduationExplanationModal.startEarningDescription":
    "Begin collecting trading fees as soon as users start trading",
  "graduationExplanationModal.enhancedFeaturesTitle": "Enhanced Features",
  "graduationExplanationModal.enhancedFeaturesDescription":
    "Unlock referral programs and advanced DEX management tools",
  "graduationExplanationModal.howItWorksTitle": "How It Works",
  "graduationExplanationModal.step1": "Pay the graduation fee in ORDER or USDC",
  "graduationExplanationModal.step2":
    "Set your custom trading fees (maker/taker)",
  "graduationExplanationModal.step3":
    "Start earning revenue from trading activity",
  "graduationExplanationModal.maybeLater": "Maybe Later",
  "graduationExplanationModal.graduateNow": "Graduate Now",

  // LanguageSupportSection
  "languageSupportSection.title": "Available Languages",
  "languageSupportSection.description":
    "Select the languages you want to support in your DEX interface.",
  "languageSupportSection.selectedCountLabel": "({{count}} selected)",
  "languageSupportSection.unselectAll": "Unselect All",
  "languageSupportSection.selectAll": "Select All",
  "languageSupportSection.noLanguagesSelected":
    "No languages selected. Your DEX will default to English only.",
  "languageSupportSection.infoTitle": "Language Support Information",
  "languageSupportSection.info1":
    "If no languages are selected, your DEX will default to English only",
  "languageSupportSection.info2":
    "Users will see a language selector in your DEX interface when multiple languages are selected",
  "languageSupportSection.info3":
    "The interface will automatically adapt to the selected language",
  "languageSupportSection.info4": "You can add or remove languages at any time",

  // ProgressTracker
  "progressTracker.configurationProgress": "Configuration Progress",
  "progressTracker.progress": "Progress",

  // ThemeEditingTabs
  "themeEditingTabs.colorPalette": "Color Palette",
  "themeEditingTabs.fonts": "Fonts",
  "themeEditingTabs.borderRadius": "Border Radius",
  "themeEditingTabs.spacing": "Spacing",
  "themeEditingTabs.clickOnColorToEdit": "Click on any color to edit",
  "themeEditingTabs.customizeFontFamilyAndSize":
    "Customize font family and size",
  "themeEditingTabs.adjustValuesWithSliders": "Adjust values with the sliders",
  "themeEditingTabs.adjustSpacingWithSliders":
    "Adjust spacing values with the sliders",
  "themeEditingTabs.css": "CSS",

  // SwapFeeWithdrawalModal
  "swapFeeWithdrawalModal.pleaseConnectWallet":
    "Please connect your wallet first",
  "swapFeeWithdrawalModal.noFeesAvailableToClaim":
    "No fees available to claim on this chain",
  "swapFeeWithdrawalModal.switchedToChainPleaseClaimAgain":
    "Switched to {{chainName}}. Please claim again.",
  "swapFeeWithdrawalModal.pleaseSwitchToChainToClaim":
    "Please switch to {{chainName}} in your wallet to claim",
  "swapFeeWithdrawalModal.transactionSubmittedWaiting":
    "Transaction submitted. Waiting for confirmation...",
  "swapFeeWithdrawalModal.swapFeesClaimedSuccessfully":
    "Swap fees claimed successfully on {{chainName}}!",
  "swapFeeWithdrawalModal.failedToClaimSwapFees": "Failed to claim swap fees",
  "swapFeeWithdrawalModal.swapFeeRevenue": "Swap Fee Revenue",
  "swapFeeWithdrawalModal.multiChainSwapFees": "Multi-Chain Swap Fees",
  "swapFeeWithdrawalModal.swapFeesTrackedPerChain":
    "Your swap fees are tracked separately on each chain. You need to claim fees on each chain individually by switching to that network.",
  "swapFeeWithdrawalModal.totalClaimable": "Total Claimable",
  "swapFeeWithdrawalModal.connected": "Connected",
  "swapFeeWithdrawalModal.loadingFees": "Loading fees...",
  "swapFeeWithdrawalModal.nativeToken": "Native Token",
  "swapFeeWithdrawalModal.claimFees": "Claim Fees",
  "swapFeeWithdrawalModal.switchAndClaim": "Switch & Claim",
  "swapFeeWithdrawalModal.claiming": "Claiming...",
  "swapFeeWithdrawalModal.noFeesAvailableToClaimShort":
    "No fees available to claim",
  "swapFeeWithdrawalModal.unsupportedNetwork": "Unsupported Network",
  "swapFeeWithdrawalModal.unsupportedNetworkDesc":
    "You're currently on {{chainName}}. To claim fees, please switch to one of the supported chains: Ethereum, Arbitrum, or Base.",
  "swapFeeWithdrawalModal.failedToLoadFees": "Failed to load fees",

  // NavigationMenuSection
  "navigationMenuSection.enableOrderTokenCampaigns":
    "Enable ORDER Token Campaigns",
  "navigationMenuSection.enableOrderTokenCampaignsDesc":
    "Enable ORDER token-related features and campaigns menu in your DEX",
  "navigationMenuSection.aboutOrderTokenCampaigns":
    "About ORDER Token Campaigns",
  "navigationMenuSection.whenEnabledAddsLinks":
    "When enabled, this feature adds ORDER token-related links and menu items to your DEX including:",
  "navigationMenuSection.orderTokenCampaignsLinks":
    "ORDER token campaigns navigation links",
  "navigationMenuSection.linksToOrderTokenPages":
    "Links to ORDER token-related pages",
  "navigationMenuSection.noteOptionalFeature":
    "Note: This is an optional feature that adds navigation links for ORDER token campaigns.",

  // PreviewErrorBoundary
  "previewErrorBoundary.previewWarning": "Preview Warning",
  "previewErrorBoundary.someFeaturesMayNotWork":
    "Some features may not work correctly in preview mode.",

  // SafeInstructions (SafeInstructionsModal)
  "safeInstructions.openWallet": "1. Open Wallet",
  "safeInstructions.createTx": "2. Create Tx",
  "safeInstructions.reviewConfirm": "3. Review & Confirm",
  "safeInstructions.getTxHash": "4. Get Tx Hash",
  "safeInstructions.safeWallet": "Safe Wallet",
  "safeInstructions.gnosisSafeInstructions": "Gnosis Safe Instructions",
  "safeInstructions.notConnected": "Not connected",
  "safeInstructions.switching": "Switching...",
  "safeInstructions.switchToChain": "Switch to {{chainName}}",
  "safeInstructions.importantMatchNetwork":
    "Important: Match Your Safe's Network",
  "safeInstructions.matchNetworkDesc":
    "Use the network selector above to choose the chain where your Safe wallet is deployed. Currently selected: <0>{{chainName}}</0>. If your Safe is on a different chain, switch using the network selector at the top before proceeding.",
  "safeInstructions.visitGnosisSafe":
    "Visit <0>Gnosis Safe</0>. Set up your wallet if not already done. Then visit the batch transaction builder as shown below.",
  "safeInstructions.enterVaultAddress": "Enter Orderly Vault Address",
  "safeInstructions.copied": "Copied!",
  "safeInstructions.copy": "Copy",
  "safeInstructions.vaultNotAvailable":
    "Vault address not available for this chain",
  "safeInstructions.copyAbi": "Copy ABI",
  "safeInstructions.loadingAbi": "Loading ABI...",
  "safeInstructions.selectContractMethod": "Select Contract Method",
  "safeInstructions.insertDataTuple": "Insert Data Tuple",
  "safeInstructions.dataTupleDesc":
    "This data will send your wallet address & Delegate Signer address.",
  "safeInstructions.createBatchTransaction": "Create Batch Transaction",
  "safeInstructions.reviewTransaction": "Review Transaction",
  "safeInstructions.reviewTransactionDesc":
    "You can simulate the transaction in order to make sure that it will not fail.",
  "safeInstructions.executeTransaction": "Execute Transaction",
  "safeInstructions.receiveTransactionHash": "Receive Transaction Hash",
  "safeInstructions.receiveTxHashDesc":
    "After the multisig transaction succeeded with enough wallets signing the transaction, you need to receive the transaction hash. Copy it in order to accept the Delegate Signer link.",
  "safeInstructions.close": "Close",

  // NavigationMenuEditor
  "navigationMenuEditor.configuringOptional":
    "Configuring navigation menus is optional. If you don't select any menus, the default menus will be displayed.",
  "navigationMenuEditor.defaultNavigationIncludes":
    "Default navigation includes: Trading, Portfolio, Markets, and Leaderboard pages. The Rewards page includes referral management and trader incentives.",
  "navigationMenuEditor.menuOrder": "Menu Order",
  "navigationMenuEditor.dragItemsToReorder": "Drag items to reorder",
  "navigationMenuEditor.editFee": "Edit Fee",
  "navigationMenuEditor.setFee": "⚠️ Set Fee",
  "navigationMenuEditor.noMenuItemsSelected":
    "No menu items selected. Default menus will be displayed.",
  "navigationMenuEditor.swapPageFeatures": "Swap Page Features:",
  "navigationMenuEditor.swapPageFeaturesDesc":
    "The Swap page allows users to exchange tokens seamlessly across multiple chains. Powered by WOOFi, this feature provides efficient token swapping with competitive rates and deep liquidity across supported networks.",
  "navigationMenuEditor.rewardsPageRequirement": "Rewards Page Requirement:",
  "navigationMenuEditor.rewardsPageRequirementDesc":
    "The Rewards page (which includes referral management) can only be fully utilized after your DEX has been graduated. You can enable the Rewards menu now, but referral features will only become active once you graduate your DEX and start earning fee splits.",
  "navigationMenuEditor.vaultsPageFeatures": "Vaults Page Features:",
  "navigationMenuEditor.vaultsPageFeaturesDesc":
    "The Vaults page enables users to earn passive yield through automated trading strategies and yield farming. Users can deposit USDC into curated vault strategies that deploy market-making strategies, handle liquidations, and accrue platform fees. This feature works across multiple blockchains with no gas fees for deposits from your DEX account.",
  "navigationMenuEditor.default": "Default",
  "navigationMenuEditor.showInformation": "Show information",
  "navigationMenuEditor.menuTrading": "Trading",
  "navigationMenuEditor.menuPortfolio": "Portfolio",
  "navigationMenuEditor.menuMarkets": "Markets",
  "navigationMenuEditor.menuLeaderboard": "Leaderboard",
  "navigationMenuEditor.menuSwap": "Swap",
  "navigationMenuEditor.menuRewards": "Rewards",
  "navigationMenuEditor.menuVaults": "Vaults",
  "navigationMenuEditor.menuPoints": "Points",

  // ReownConfigSection
  "reownConfigSection.enhancedWalletConnectivity":
    "Enhanced Wallet Connectivity with Reown",
  "reownConfigSection.whatIsReown":
    "<0>What is Reown?</0> Reown (formerly WalletConnect) provides a superior wallet connection experience that goes far beyond basic browser wallet integration.",
  "reownConfigSection.keyBenefits": "🚀 Key Benefits for Your DEX Users:",
  "reownConfigSection.mobileWalletSupport":
    "<0>Mobile Wallet Support:</0> Users can connect mobile wallets like MetaMask Mobile, Trust Wallet, and 300+ others via QR code scanning",
  "reownConfigSection.crossPlatformAccess":
    "<0>Cross-Platform Access:</0> Desktop users can connect to mobile wallets seamlessly, and mobile users get native app connections",
  "reownConfigSection.universalCompatibility":
    "<0>Universal Compatibility:</0> Works with virtually every major wallet, not just browser extensions",
  "reownConfigSection.betterUx":
    "<0>Better UX:</0> Clean, modern connection modal with wallet detection and connection status",
  "reownConfigSection.secureConnections":
    "<0>Secure Connections:</0> Encrypted peer-to-peer connections between your DEX and user wallets",
  "reownConfigSection.whyThisMatters": "💡 Why This Matters:",
  "reownConfigSection.whyThisMattersDesc":
    "Without Reown, your DEX can only connect to browser extension wallets (like MetaMask desktop). With Reown, mobile users can scan a QR code to connect their mobile wallets, dramatically expanding your potential user base and improving accessibility.",
  "reownConfigSection.reownProjectId": "Reown Project ID",
  "reownConfigSection.placeholderProjectId": "Enter your Reown Project ID",
  "reownConfigSection.howToGetProjectId": "How to get your free Project ID:",
  "reownConfigSection.step1CreateAccount":
    "Visit <0>Reown Dashboard</0> and create a free account",
  "reownConfigSection.step2SetupWizard":
    "Set up your project following their setup wizard",
  "reownConfigSection.step3CopyId":
    "Copy the Project ID from the top header of your project dashboard",
  "reownConfigSection.integrationNotes": "🔗 Integration Notes:",
  "reownConfigSection.note1":
    "Your DEX will work perfectly fine without this - it's purely an enhancement",
  "reownConfigSection.note2":
    "If you enable Privy integration, Privy will automatically use this Project ID",
  "reownConfigSection.note3":
    "Free tier includes 10,000 monthly active wallets - more than enough for most DEXs",
  "reownConfigSection.note4":
    "No additional configuration needed - just paste your Project ID and you're done!",
  "reownConfigSection.domainAllowlistRequired":
    "⚠️ Important: Domain Allowlist Configuration Required",
  "reownConfigSection.domainAllowlistDesc":
    "After creating your project, you MUST configure the domain allowlist in your Reown dashboard for your DEX to work properly.",
  "reownConfigSection.howToConfigureDomains": "How to configure domains:",
  "reownConfigSection.domainStep1":
    "Go to your project dashboard at <0>dashboard.reown.com</0>",
  "reownConfigSection.domainStep2": 'Navigate to the "Domain" section',
  "reownConfigSection.domainStep3": 'Click "Domain" to add your DEX domain',
  "reownConfigSection.domainStep4":
    "Add your domain (e.g., <0>https://yourdex.com</0>)",
  "reownConfigSection.proTip":
    "💡 Pro tip: You can use wildcards like <0>https://*.subdomain.com</0> to allow all subdomains.",

  // PrivyConfigSection
  "privyConfigSection.enhancedWalletOptions":
    "Privy provides enhanced wallet connection options",
  "privyConfigSection.whyUsePrivy": "Why use Privy?",
  "privyConfigSection.privyProvidesMultiple":
    "Privy provides multiple wallet connection options:",
  "privyConfigSection.socialLogins": "Social logins (Google, Discord, Twitter)",
  "privyConfigSection.emailPhoneAuth": "Email/phone authentication",
  "privyConfigSection.multipleWalletTypes":
    "Multiple wallet types from a single interface",
  "privyConfigSection.embeddedWallets": "Embedded wallets for non-crypto users",
  "privyConfigSection.privyAppId": "Privy App ID",
  "privyConfigSection.placeholderAppId": "Enter your Privy App ID",
  "privyConfigSection.getAppIdBySigningUp":
    "Get a Privy App ID by signing up at <0>Privy Dashboard</0>. When creating an app, be sure to select <1>client-side</1> and <2>web</2> options. You'll find your App ID in the app settings.",
  "privyConfigSection.privyTermsOfUseUrl": "Privy Terms of Use URL",
  "privyConfigSection.optional": "optional",
  "privyConfigSection.termsOfUseHelp":
    "Enter the URL to your terms of service that will be displayed during Privy login. This is optional and only needed if you want to show terms during the login process. Must be a valid URL if provided.",
  "privyConfigSection.loginMethods": "Login Methods",
  "privyConfigSection.chooseAuthMethods":
    "Choose which authentication methods users can use to sign in to your DEX.",
  "privyConfigSection.configurePrivyAppId":
    "Configure a Privy App ID above to enable these options.",
  "privyConfigSection.email": "Email",
  "privyConfigSection.emailAuth": "Email-based authentication",
  "privyConfigSection.passkey": "Passkey",
  "privyConfigSection.passkeyAuth": "Biometric and security key authentication",
  "privyConfigSection.requiresPasskey":
    "Requires enabling Passkey in your Privy dashboard",
  "privyConfigSection.x": "X",
  "privyConfigSection.signInWithX": "Sign in with X account",
  "privyConfigSection.requiresOAuth":
    "Requires OAuth setup in your Privy dashboard",
  "privyConfigSection.google": "Google",
  "privyConfigSection.signInWithGoogle": "Sign in with Google account",
  "privyConfigSection.walletConfiguration": "Wallet Configuration",
  "privyConfigSection.enableEvmWallets": "Enable EVM Wallets",
  "privyConfigSection.evmWalletsDesc":
    "Allows users to connect Ethereum-compatible wallets (MetaMask, Coinbase, etc.)",
  "privyConfigSection.enableSolanaWallets": "Enable Solana Wallets",
  "privyConfigSection.solanaWalletsDesc":
    "Allows users to connect Solana wallets (Phantom, Solflare, etc.)",
  "privyConfigSection.enableAbstractWallet":
    "Enable Abstract Wallet (via Privy)",
  "privyConfigSection.abstractWalletEnabled":
    "Enables Abstract's wallet solution powered by Privy. This allows users to connect using Abstract's wallet on the Abstract blockchain.",
  "privyConfigSection.abstractWalletRequiresPrivy":
    "Requires a Privy App ID to be set above before this can be enabled.",

  // SwapFeeConfigModal
  "swapFeeConfigModal.configureSwapFee": "Configure Swap Fee",
  "swapFeeConfigModal.setupFeeDesc":
    "Set up your fee for the WOOFi-powered swap integration",
  "swapFeeConfigModal.swapFeeBps": "Swap Fee (in basis points)",
  "swapFeeConfigModal.placeholder": "e.g., 20 (0.2%)",
  "swapFeeConfigModal.enterFeeHelp":
    "Enter fee in basis points (bps). Maximum: 100 bps (1%). Example: 20 bps = 0.2%",
  "swapFeeConfigModal.feeRequired":
    "Swap fee is required when Swap page is enabled",
  "swapFeeConfigModal.enterValidNumber": "Please enter a valid number",
  "swapFeeConfigModal.feeMustBeBetween":
    "Fee must be between 0 and 100 bps (maximum 1%)",
  "swapFeeConfigModal.feeBreakdown": "Fee Breakdown",
  "swapFeeConfigModal.totalSwapFee": "Total swap fee",
  "swapFeeConfigModal.yourEarnings": "Your earnings (70%)",
  "swapFeeConfigModal.woofiShare": "WooFi share (30%)",
  "swapFeeConfigModal.aboutSwapIntegration": "About Swap Integration",
  "swapFeeConfigModal.swapPoweredByWoofi":
    "The Swap page is powered by <0>WOOFi</0>, providing efficient token swapping with competitive rates and deep liquidity.",
  "swapFeeConfigModal.evmOnly":
    "<0>EVM only:</0> Swap supports EVM chains only (no Solana)",
  "swapFeeConfigModal.fixedBlockchainSupport":
    "<0>Fixed blockchain support:</0> Blockchain configuration doesn't affect the Swap page",
  "swapFeeConfigModal.feeSplit":
    "<0>Fee split:</0> Fees are shared <1>70% (you)</1> / <2>30% (WOOFi)</2>",
  "swapFeeConfigModal.importantGraduation":
    "Important: Graduation & Fee Claiming",
  "swapFeeConfigModal.graduationRequired":
    "<0>Graduation Required:</0> Your DEX must be graduated before you can earn swap fees. After graduation, it may take up to 24 hours for the fee system to be fully activated.",
  "swapFeeConfigModal.manualFeeClaiming":
    "<0>Manual Fee Claiming Required:</0> Swap fees are <1>NOT</1> automatically transferred to your wallet. You must manually claim accumulated fees using a claiming process.",
  "swapFeeConfigModal.eoaWalletOnly":
    "<0>EOA Wallet Only:</0> Fees can only be claimed with the EOA wallet you used to initially set up your DEX. Fees will <1>NOT</1> accrue in your admin wallet (which may be a multisig).",
  "swapFeeConfigModal.cancel": "Cancel",
  "swapFeeConfigModal.saveConfiguration": "Save Configuration",

  // ServiceDisclaimerSection
  "serviceDisclaimerSection.enableDialog": "Enable Service Disclaimer Dialog",
  "serviceDisclaimerSection.enableDialogDesc":
    "Show a one-time disclaimer dialog on first visit to inform users that this platform uses Orderly Network's white-label solution and is not a direct operator of the orderbook. The dialog will be stored in localStorage and won't show again after the user accepts.",
  "serviceDisclaimerSection.preview": "Preview",
  "serviceDisclaimerSection.whenEnabledUsersWillSee":
    "When enabled, users will see a dialog on their first visit with the following message:",
  "serviceDisclaimerSection.serviceDisclaimer": "Service Disclaimer",
  "serviceDisclaimerSection.brokerUsesOrderly":
    "[Your Broker Name] uses Orderly Network's white-label solution and is not a direct operator of the orderbook.",
  "serviceDisclaimerSection.byClickingAgree":
    "By clicking 'Agree', users will access a third-party website using Orderly software. [Your Broker Name] confirms that it does not directly operate or control the infrastructure or take responsibility for code operations.",

  // ServiceRestrictionsSection
  "serviceRestrictionsSection.searchForRegion": "Search for a region...",
  "serviceRestrictionsSection.restrictedRegions": "Restricted Regions",
  "serviceRestrictionsSection.restrictedRegionsDesc":
    "Select regions that should be restricted from accessing your DEX.",
  "serviceRestrictionsSection.whitelistedIps": "Whitelisted IP Ranges",
  "serviceRestrictionsSection.whitelistedIpsDesc":
    "IP ranges that can bypass region restrictions (CIDR notation, e.g., 192.168.1.0/24)",

  // GraduationForm
  "graduationForm.brokerIdCreated": "Broker ID Created!",
  "graduationForm.completeYourGraduation": "Complete Your Graduation",
  "graduationForm.graduatedSuccessfully": "Graduated Successfully!",
  "graduationForm.congratulations": "Congratulations!",
  "graduationForm.feeRevenueSharing": "Fee Revenue Sharing",
  "graduationForm.customFeeConfiguration": "Custom Fee Configuration",
  "graduationForm.withdrawStep1": 'Click the "Withdraw Fees" button below',
  "graduationForm.withdrawStep2":
    "Enter the amount of USDC you want to withdraw",
  "graduationForm.graduateYourDex": "Graduate Your DEX",
  "graduationForm.whatIsDexGraduation": "What is DEX Graduation?",
  "graduationForm.whySendTokens": "Why send tokens for graduation?",
  "graduationForm.usingToken": "Using token",
  "graduationForm.yourBalance": "Your balance",
  "graduationForm.amount": "Amount",
  "graduationForm.transferSuccessfulVerifying":
    "Transfer successful! Verifying transaction...",
  "graduationForm.recipientAddress": "Recipient Address:",
  "graduationForm.enterBrokerIdToContinue":
    "Please enter your broker ID to continue",
  "graduationForm.fixBrokerIdError": "Please fix the broker ID error above",
  "graduationForm.enterTxHashToVerify":
    "Please enter the transaction hash to verify",
  "graduationForm.copiedToClipboard": "{{label}} copied to clipboard",
  "graduationForm.failedToCopyToClipboard": "Failed to copy to clipboard",
  "graduationForm.enterMultisigAddress": "Please enter your multisig address",
  "graduationForm.enterSafeTransactionHash":
    "Please enter the transaction hash from your Safe transaction",
  "graduationForm.connectWalletFirst": "Please connect your wallet first",
  "graduationForm.noBrokerIdFound":
    "No broker ID found. Please complete the previous steps first.",
  "graduationForm.multisigRegisteredSuccess":
    "Multisig registered and admin wallet setup completed! Your DEX has graduated successfully.",
  "graduationForm.failedToRegisterMultisig": "Failed to register multisig",
  "graduationForm.noWalletClientAvailable":
    "No wallet client available. Please ensure your wallet is connected.",
  "graduationForm.accountRegisteredSuccessfully":
    "Account registered successfully!",
  "graduationForm.adminWalletSetupSuccess":
    "Admin wallet setup completed! Your DEX has graduated successfully.",
  "graduationForm.failedToFinalizeAdminWallet":
    "Failed to finalize admin wallet setup",
  "graduationForm.enterBrokerId": "Please enter your broker ID",
  "graduationForm.missingTokenAddressConfig":
    "Missing token address configuration",
  "graduationForm.missingReceiverAddressConfig":
    "Missing receiver address configuration",
  "graduationForm.loadingTokenInfo":
    "Loading token information, please try again in a moment",
  "graduationForm.invalidReceiverAddressConfig":
    "Invalid receiver address configuration",
  "graduationForm.ensureCorrectNetwork":
    "Please make sure your wallet is on the correct network before continuing",
  "graduationForm.feeOptionsNotLoaded":
    "Fee options not loaded. Please try again.",
  "graduationForm.failedToInitiateTransfer": "Failed to initiate transfer",
  "graduationForm.failedToInitiateTransferWithReason":
    "Failed to initiate transfer: {{message}}",
  "graduationForm.verifyingTransactionWait":
    "Verifying transaction... This may take up to 1-2 minutes. Please wait.",
  "graduationForm.transactionVerifiedSuccessfully":
    "Transaction verified successfully!",
  "graduationForm.verificationFailed": "Verification failed",
  "graduationForm.connectionLostRefreshing":
    "Connection lost during verification. The transaction may have succeeded. Refreshing page to check status...",
  "graduationForm.finalStepRequired": "Final Step Required",
  "graduationForm.notEarningFeesYet": "You are not earning fees yet.",
  "graduationForm.completeAdminWalletSetup":
    "Complete the admin wallet setup to start earning revenue from your DEX.",
  "graduationForm.selectWalletType": "Select Wallet Type",
  "graduationForm.eoaWallet": "EOA Wallet",
  "graduationForm.gnosisSafe": "Gnosis Safe",
  "graduationForm.whatThisDoes": "What This Does",
  "graduationForm.registersEvmAddress":
    "• Registers your EVM address with Orderly Network",
  "graduationForm.createsBrokerAccount":
    "• Creates your broker account for fee collection",
  "graduationForm.enablesRevenueSharing":
    "• Enables revenue sharing from your DEX",
  "graduationForm.registeringWithOrderly": "Registering with Orderly...",
  "graduationForm.registerWithOrderly": "Register with Orderly & Start Earning",
  "graduationForm.gnosisSafeWallet": "Gnosis Safe Wallet",
  "graduationForm.multisigEnhancedSecurity":
    "• Enhanced security with multi-signature approval",
  "graduationForm.multisigShareControl":
    "• Share control with multiple signers",
  "graduationForm.multisigForTeams": "• Perfect for teams and organizations",
  "graduationForm.viewSetupInstructions": "View Setup Instructions",
  "graduationForm.registerYourMultisig": "Register Your Multisig",
  "graduationForm.multisigAddress": "Multisig Address",
  "graduationForm.multisigAddressPlaceholder":
    "0x... or eth:0x... or base:0x...",
  "graduationForm.transactionHash": "Transaction Hash",
  "graduationForm.registeringMultisig": "Registering multisig...",
  "graduationForm.registerMultisig": "Register Multisig",
  "graduationForm.connectWalletToRegisterMultisig":
    "Please connect your wallet to register your multisig",
  "graduationForm.stepByStepGuide": "Step-by-Step Guide",
  "graduationForm.yourDexIsReady": "Your DEX is Ready!",
  "graduationForm.dexReadyDescription":
    "Your DEX has been deployed with your broker ID and is now fully operational. Users can start trading and you'll earn fees from all trades.",
  "graduationForm.viewYourLiveDex": "View Your Live DEX →",
  "graduationForm.yourDexBenefits": "Your DEX Benefits",
  "graduationForm.brokerIdFormatInvalid":
    "Broker ID must contain only lowercase letters, numbers, hyphens, and underscores",
  "graduationForm.brokerIdAlreadyTaken":
    "This broker ID is already taken. Please choose another one.",
  "graduationForm.failedToLoadFeeOptions":
    "Failed to load graduation fee options",
  "graduationForm.eoaDescription":
    "This registers your connected EOA (Externally Owned Account) wallet with Orderly Network and activates your broker account. Once completed, you'll start earning fees from all trades on your DEX.",
  "graduationForm.signMessagePrompt":
    "When you click the button above, you'll be prompted to sign a message to register your EVM address with Orderly Network using broker ID {{brokerId}}. This happens directly in your wallet.",
  "graduationForm.gnosisSafeDescription":
    "Use this option if you want to register a Gnosis Safe multisig wallet as your admin wallet. This provides enhanced security through multi-signature approval for fee withdrawals and admin actions.",
  "graduationForm.multisigAddressHelp":
    "Enter your Gnosis Safe address. Chain prefixes (eth:, base:, arb:) are supported.",
  "graduationForm.transactionHashHelp":
    "The transaction hash from your Safe delegateSigner transaction.",
  "graduationForm.viewSetupInstructionsHelp":
    'Click "View Setup Instructions" above to see detailed steps on how to set up your Gnosis Safe wallet with broker ID {{brokerId}}.',
  "graduationForm.graduationSuccessDescription":
    "Your DEX has successfully graduated to the revenue-sharing tier. Your custom broker ID {{brokerId}} is now active and your DEX is fully ready for users!",
  "graduationForm.feeRevenueSharingDescription":
    "You now earn a percentage of all trading fees generated through your DEX.",
  "graduationForm.customFeeConfigurationDescription":
    "You can now customize your maker and taker fees to optimize for your trading community.",
  "graduationForm.switchingToCorrectNetworkForMultisig":
    "Switching to the correct network for this multisig address",
  "graduationForm.unknownErrorOccurred": "Unknown error occurred",
  "graduationForm.brokerIdCreatedDescription":
    "Your broker ID <0>{{brokerId}}</0> has been created. Complete the final step to start earning fees.",
  "graduationForm.multisigFeeWithdrawalTitle": "Multisig Fee Withdrawal",
  "graduationForm.multisigFeeWithdrawalDescription":
    "Since you're using a multisig wallet as your admin wallet, use the withdrawal modal below to transfer fees from your Orderly account to your Safe wallet.",
  "graduationForm.howToWithdrawFees": "How to Withdraw Fees",
  "graduationForm.withdrawStep3":
    "Sign the EIP-712 messages in your connected wallet (for PnL settlement and withdrawal)",
  "graduationForm.withdrawStep4":
    "Fees will be transferred from your Orderly account to your Safe wallet",
  "graduationForm.importantNote": "Important Note",
  "graduationForm.multisigWithdrawalsNote":
    "All fee withdrawals must be approved by the required number of signers in your Safe wallet, providing enhanced security for your earnings.",
  "graduationForm.withdrawFeesButton": "Withdraw Fees",
  "graduationForm.createOrderlyKeyButton": "Create Orderly Key",
  "graduationForm.unableToRetrieveMultisigConfig":
    "Unable to retrieve multisig configuration. Please ensure you have completed the multisig registration.",
  "graduationForm.yourBrokerTier": "Your Broker Tier",
  "graduationForm.currentTierLevel": "Current Tier Level",
  "graduationForm.stakingVolume": "Staking Volume",
  "graduationForm.tradingVolume": "Trading Volume",
  "graduationForm.orderlyMakerFee": "Orderly Maker Fee",
  "graduationForm.orderlyTakerFee": "Orderly Taker Fee",
  "graduationForm.lastUpdated": "Last updated",
  "graduationForm.tierBenefitsDescription":
    "<0>Tier Benefits:</0> Higher tiers reduce the fees Orderly charges you, allowing you to earn higher fees yourself. Stake more ORDER tokens or increase trading volume to upgrade your tier.",
  "graduationForm.adminWalletStakingTitle": "Important: Admin Wallet Staking",
  "graduationForm.adminWalletStakingDescriptionMultisig":
    "ORDER tokens must be staked on your admin wallet (your multisig: <0>{{address}}</0>) to count towards your broker tier. Staking on other addresses will not improve your tier.",
  "graduationForm.adminWalletStakingDescriptionEoa":
    "ORDER tokens must be staked on your admin wallet (your connected EOA wallet) to count towards your broker tier. Staking on other addresses will not improve your tier.",
  "graduationForm.dailyTierUpdatesTitle": "Daily Tier Updates",
  "graduationForm.dailyTierUpdatesDescription":
    "Tier information is updated once per day, so changes to your staking or trading volume may take up to 24 hours to reflect in your tier level.",
  "graduationForm.graduationIntro":
    "Graduating your DEX enables revenue sharing and additional features:",
  "graduationForm.graduationBenefitRevenue":
    "You'll earn a percentage of all trading fees generated through your DEX",
  "graduationForm.graduationBenefitCustomFees":
    "You can customize trading fees to optimize for your community",
  "graduationForm.graduationRequirementDescription":
    "This requirement ensures DEX creators are committed to the Orderly ecosystem and helps maintain quality standards.",
  "graduationForm.tradingFeeConfigurationTitle": "Trading Fee Configuration",
  "graduationForm.tradingFeeConfigurationDescription":
    "Configure your trading fees to determine your revenue split. Default values are shown below.",
  "graduationForm.brokerIdLabel": "Broker ID",
  "graduationForm.brokerIdPlaceholder": "my-broker-id",
  "graduationForm.brokerIdHelp1":
    "Your preferred unique broker ID (5-15 characters, lowercase letters, numbers, hyphens, and underscores only)",
  "graduationForm.brokerIdHelp2":
    "This ID uniquely identifies your DEX in the Orderly ecosystem and will be used for revenue tracking and user rewards.",
  "graduationForm.brokerIdAvailable": "Broker ID is available",
  "graduationForm.choosePaymentMethod":
    "Choose your graduation payment method:",
  "graduationForm.doNotSendTokensManuallyTitle": "Do NOT send tokens manually",
  "graduationForm.doNotSendTokensManuallyDescription":
    "The system will handle the token transfer automatically when you click the button below. Do not send tokens to any address manually - this will not complete your graduation.",
  "graduationForm.autoTransferDescription":
    "The system will automatically transfer the required tokens when you click the button below.",
  "graduationForm.needOrderTokensCta": "Need ORDER tokens? Buy here",
  "graduationForm.sendTokensTitle": "Send {{token}} Tokens",
  "graduationForm.sendTokensDescription":
    "Send {{token}} tokens and verify in one step directly from your wallet.",
  "graduationForm.insufficientForGraduation": "Insufficient for graduation",
  "graduationForm.buyOrderCta": "Buy ORDER",
  "graduationForm.saveWithOrderTitle": "Save 25% by paying with ORDER tokens!",
  "graduationForm.saveWithOrderDescription":
    "Instead of ${{usdcAmount}} USDC, pay only {{orderAmount}} ORDER (~${{orderValue}}).",
  "graduationForm.discount25Off": "25% OFF",
  "graduationForm.loading": "Loading...",
  "graduationForm.confirmInWallet": "Confirm in wallet...",
  "graduationForm.confirming": "Confirming...",
  "graduationForm.verifyingTransactionLoading":
    "Verifying transaction... This may take 1-2 minutes",
  "graduationForm.transferTokensCta": "Transfer {{token}} Tokens",
  "graduationForm.switchChainCta": "Switch Chain",
  "graduationForm.viewOnExplorer": "View on Explorer",
  "graduationForm.hideManualOption": "Hide manual option",
  "graduationForm.showManualOption": "I already sent {{token}} tokens",
  "graduationForm.manualVerificationTitle": "Manual Transaction Verification",
  "graduationForm.manualVerificationDescription":
    "If you've already sent {{token}} tokens, enter the transaction hash to verify and complete your graduation.",
  "graduationForm.copy": "Copy",
  "graduationForm.tokenAddressLabel": "{{token}} Token Address:",
  "graduationForm.buyTokenCta": "Buy {{token}}",
  "graduationForm.transactionVerificationTitle": "Transaction Verification",
  "graduationForm.transactionVerificationDescription":
    "Verification involves checking the blockchain transaction and may take 1-2 minutes to complete. Please be patient and do not refresh the page during this process.",
  "graduationForm.txHashHelpText":
    "The transaction hash of your {{token}} token transfer",
  "graduationForm.verifyTransactionButton": "Verify Transaction",
  "graduationForm.verifiedTransfer":
    "Verified transfer of {{amount}} {{token}} tokens",

  // TradingViewLicenseModal
  "tradingViewLicenseModal.title": "TradingView License Guide",
  "tradingViewLicenseModal.goodNews": "Good News: It's Completely Free!",
  "tradingViewLicenseModal.freeLicenseDesc":
    "The TradingView Advanced Charts license is free for commercial use. You just need to fill out their application form to get approved.",
  "tradingViewLicenseModal.whatYouNeed": "What You Need to Do",
  "tradingViewLicenseModal.visitTradingViewPage":
    "Visit the <0>TradingView Advanced Charts page</0>",
  "tradingViewLicenseModal.clickGetLibrary":
    'Click on "Get the library" to open the application form',
  "tradingViewLicenseModal.fillOutForm":
    "Fill out the form with the details provided below",
  "tradingViewLicenseModal.waitForApproval":
    "Wait for approval (usually takes a few business days)",
  "tradingViewLicenseModal.whereToClick": "Where to Click",
  "tradingViewLicenseModal.lookForGetLibrary":
    'Look for the "Get the library" button on the TradingView Advanced Charts page',
  "tradingViewLicenseModal.applicationFormDetails": "Application Form Details",
  "tradingViewLicenseModal.websiteUrl": "Website URL:",
  "tradingViewLicenseModal.websiteUrlDesc":
    "Use your custom domain (the one you're setting up in the Custom Domain section)",
  "tradingViewLicenseModal.githubProfile": "GitHub Profile",
  "tradingViewLicenseModal.githubProfileDesc":
    "You'll need to create a personal <0>GitHub account</0>. Even though you won't need direct access to their library (we've already handled that), it's required for the application process.",
  "tradingViewLicenseModal.companyProfile": "Company Profile:",
  "tradingViewLicenseModal.companyProfileValue": "Crypto Exchange",
  "tradingViewLicenseModal.ownDataFeed": "Own Data Feed:",
  "tradingViewLicenseModal.ownDataFeedValue": "Yes",
  "tradingViewLicenseModal.reasonForRequest": "Reason for Request:",
  "tradingViewLicenseModal.reasonForRequestDesc":
    "Mention that this is for a perpetual futures decentralized exchange",
  "tradingViewLicenseModal.importantNotes": "Important Notes",
  "tradingViewLicenseModal.note1":
    "The license application is free and typically approved within a few business days",
  "tradingViewLicenseModal.note2":
    "You must apply using your custom domain, not the GitHub Pages URL",
  "tradingViewLicenseModal.note3":
    "The GitHub account requirement is just for their application process",
  "tradingViewLicenseModal.note4":
    "Once approved, your DEX will continue working normally with the TradingView charts",
  "tradingViewLicenseModal.applyForLicense": "Apply for TradingView License",

  // TradingViewLicenseAcknowledgmentModal
  "tradingViewLicenseAckModal.title": "Important: TradingView License Required",
  "tradingViewLicenseAckModal.customDomainRequirement":
    "Custom Domain License Requirement",
  "tradingViewLicenseAckModal.customDomainRequirementDesc":
    "When using your own custom domain, you are required to apply for your own TradingView Advanced Charts license. The default license only covers the default GitHub Pages domain.",
  "tradingViewLicenseAckModal.goodNews": "Good News: It's Completely Free!",
  "tradingViewLicenseAckModal.goodNewsDesc":
    "The TradingView Advanced Charts license is free for commercial use. You just need to fill out their application form to get approved (usually takes a few business days).",
  "tradingViewLicenseAckModal.whatYouNeed": "What You Need to Do",
  "tradingViewLicenseAckModal.visitPagePrefix": "Visit the",
  "tradingViewLicenseAckModal.visitPageLink":
    "TradingView Advanced Charts page",
  "tradingViewLicenseAckModal.clickGetLibrary":
    'Click on "Get the library" to open the application form',
  "tradingViewLicenseAckModal.fillOutForm":
    "Fill out the form with your custom domain and business details",
  "tradingViewLicenseAckModal.waitForApproval":
    "Wait for approval (usually takes a few business days)",
  "tradingViewLicenseAckModal.importantNotes": "Important Notes",
  "tradingViewLicenseAckModal.ackNote1":
    "You can set up your custom domain now and apply for the license while DNS propagates",
  "tradingViewLicenseAckModal.ackNote2":
    "The license application is free and typically approved within a few business days",
  "tradingViewLicenseAckModal.ackNote3":
    "You must apply using your custom domain, not the GitHub Pages URL",
  "tradingViewLicenseAckModal.ackNote4":
    "Once approved, your DEX will continue working normally with the TradingView charts",
  "tradingViewLicenseAckModal.needHelp": "Need Help with the Application?",
  "tradingViewLicenseAckModal.needHelpDesc":
    "View our detailed guide with screenshots and form details",
  "tradingViewLicenseAckModal.viewGuide": "View Guide",
  "tradingViewLicenseAckModal.acknowledgmentText":
    "I understand that I must apply for a TradingView Advanced Charts license when using a custom domain, and that failure to do so may result in the TradingView charts not working properly on my custom domain.",
  "tradingViewLicenseAckModal.cancel": "Cancel",
  "tradingViewLicenseAckModal.iHaveRead": "I Have Read and Understand",

  // MLRConfirmModal
  "mlrConfirmModal.title": "Upgrade to Multi-Level Referral?",
  "mlrConfirmModal.cancel": "Cancel",
  "mlrConfirmModal.confirmUpgrade": "Confirm & Upgrade",

  // OrderlyKeyLoginModal (toast messages)
  "orderlyKeyLoginModal.switchNetworkRequired":
    "Please switch to the required network in your wallet",
  "orderlyKeyLoginModal.connectWalletFirst": "Please connect your wallet first",
  "orderlyKeyLoginModal.switchNetworkMultisigToast":
    "Please switch to the network where your multisig delegate signer link was established",
  "orderlyKeyLoginModal.switchNetworkSupportedToast":
    "Please switch to a supported network",
  "orderlyKeyLoginModal.missingAccountInfo":
    "Missing required account information",
  "orderlyKeyLoginModal.keyCreatedSuccess": "Orderly key created successfully!",
  "orderlyKeyLoginModal.failedToCreateKey":
    "Failed to create orderly key. Please try again.",

  // SocialLinksSection
  "socialLinksSection.telegramUrl": "Telegram URL",
  "socialLinksSection.discordUrl": "Discord URL",
  "socialLinksSection.xUrl": "Twitter/X URL",
  "socialLinksSection.optional": "optional",

  // WalletConnect
  "walletConnect.connectionError": "Connection error",

  // AuthContext
  "authContext.sessionExpired":
    "Your session has expired. Please log in again.",
  "authContext.walletSwitched":
    "Wallet switched. Please sign in with the new wallet.",
  "authContext.noWalletConnected": "No wallet connected",
  "authContext.failedToGetNonce": "Failed to get authentication nonce",
  "authContext.signatureVerificationFailed": "Signature verification failed",
  "authContext.authenticationFailed": "Authentication failed",

  // DexContext
  "dexContext.failedToFetchDexData": "Failed to fetch DEX data",

  // ModalContext
  "modalContext.defaultConfirmTitle": "Confirm Action",
  "modalContext.defaultConfirmMessage": "Are you sure you want to proceed?",
  "modalContext.defaultConfirmButtonText": "Confirm",
  "modalContext.defaultCancelButtonText": "Cancel",

  // navigation (utils/navigation.tsx)
  "navigation.home": "Home",
  "navigation.board": "Board",
  "navigation.caseStudies": "Case Studies",
  "navigation.distributor": "Distributor",
  "navigation.myDex": "My DEX",

  // imageUtils (utils/imageUtils.ts)
  "imageUtils.unsupportedFormat":
    "Unsupported image format. Please use JPEG, PNG, or WebP.",
  "imageUtils.failedToProcess": "Failed to process image: {{message}}",
  "imageUtils.canvasContextError":
    "Could not create canvas context for cropping",
  "imageUtils.sourceCanvasContextError":
    "Could not create source canvas context",
  "imageUtils.unknownSourceType": "Unknown source type: {{sourceType}}",
  "imageUtils.failedToLoadForDimensions":
    "Failed to load image for dimension calculation",

  // SystemStatus
  "systemStatus.maintenance": "System under maintenance.",
  "systemStatus.operational": "All systems operational.",

  // SwapFeeWithdrawal
  "swapFeeWithdrawal.title": "Swap Fee Revenue (WOOFi)",
  "swapFeeWithdrawal.description":
    "Claim your accumulated swap fees from the WOOFi integration. Fees are earned from users swapping tokens on your DEX's swap page.",
  "swapFeeWithdrawal.viewAndClaim": "View & Claim Swap Fees",
  "swapFeeWithdrawal.connectWalletHint":
    "Please connect your wallet to view and claim fees",
};
