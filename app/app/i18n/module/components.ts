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
  "themeEditorTabsModal.resetToDefault": "Reset to Default",

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
  "orderlyKeyLoginModal.createKey": "Create Key",
  "orderlyKeyLoginModal.creatingKey": "Creating Key",
  "orderlyKeyLoginModal.switchNetwork": "Switch Network",

  // OrderlyKey (useCreateOrderlyKey hook)
  "orderlyKey.createFailed": "Failed to create orderly key",

  // WorkflowStatus
  "workflowStatus.loading": "Loading workflow status...",
  "workflowStatus.errorTitle": "Workflow Status Error",
  "workflowStatus.retry": "Retry",
  "workflowStatus.waitingForWorkflows": "Waiting for workflows to start...",
  "workflowStatus.workflowStatus": "Workflow Status",
  "workflowStatus.workflowStatusNamed": '"{{workflowName}}" Workflow Status',
  "workflowStatus.noRecentRuns": "No recent workflow runs found",
  "workflowStatus.loadingDetails": "Loading...",
  "workflowStatus.runId": "Run #{{runId}}",
  "workflowStatus.showingRecent":
    "Showing 5 most recent of {{total}} total runs",
  "workflowStatus.loadingWorkflowDetails": "Loading workflow details...",
  "workflowStatus.runDetails": "Run Details",
  "workflowStatus.viewOnGitHub": "View on GitHub",
  "workflowStatus.closeDetails": "Close details",
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

  // DeleteConfirmModal
  "deleteConfirmModal.confirmMessage":
    "Are you sure you want to delete this {{entityNameLower}}? This action cannot be undone.",
  "deleteConfirmModal.warningTitle": "Warning",
  "deleteConfirmModal.warningDesc":
    "Deleting your {{entityNameLower}} will permanently remove all associated data from the system, including the GitHub repository. However, any deployed instances on GitHub Pages will remain active and must be manually disabled through GitHub.",
  "deleteConfirmModal.deleting": "Deleting",
  "deleteConfirmModal.deleteButton": "Delete {{entityName}}",

  // Footer
  "footer.developers": "Developers",
  "footer.documentation": "Documentation",
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
  "languageSwitcher.tips":
    "AI-generated translations may not be fully accurate.",

  // ConnectWalletAuthGuard
  "connectWalletAuthGuard.title": "Connect wallet",
  "connectWalletAuthGuard.description":
    "Authentication required. Please connect your wallet and login.",

  // GraduationAuthGuard
  "graduationAuthGuard.description":
    "The feature you are trying to access is only available for graduated DEXs. You need to graduate your DEX first to access the feature.",
  "graduationAuthGuard.graduateButton": "Graduate Your DEX",

  // OrderlyKeyAuthGuard
  "orderlyKeyAuthGuard.title": "Orderly Key Required",
  "orderlyKeyAuthGuard.description":
    "This key provides secure access to the Orderly Network API. It will be stored locally to manage your distributor profile. A wallet signature is required to create this key.",
  "orderlyKeyAuthGuard.createButton": "Create Orderly Key",

  // AccordionItem
  "accordionItem.completePreviousSteps":
    "Please complete the previous required steps first.",
  "accordionItem.optional": "Optional",
  "accordionItem.skip": "Skip",

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
  "adminLoginModal.howToLogIn": "How to log in",
  "adminLoginModal.step1": "Open the Admin Dashboard link",
  "adminLoginModal.step2": "Paste your Account ID in the first field",
  "adminLoginModal.step3": "Paste your Public Key in the second field",
  "adminLoginModal.step4": "Paste your Private Key in the third field",
  "adminLoginModal.step5": 'Click "Sign In" to access your broker settings',
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
  "aiFineTuneModal.describePrompt":
    "Describe how you want this element and its children to look. The AI will generate CSS overrides for the entire HTML structure.",
  "aiFineTuneModal.note": "Note",
  "aiFineTuneModal.noteDesc":
    "This will generate CSS overrides for the selected element and all its child elements. The changes will be applied as CSS classes or selectors targeting the structure.",
  "aiFineTuneModal.elements": "Elements",
  "aiFineTuneModal.elementsCount": "{{count}} element(s) (depth 0-3)",
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
  "aiFineTunePreviewModal.acceptChanges": "Accept Changes",

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
  "assetFilterSection.assetFiltering": "Asset Filtering",
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
  "baseFeeExplanation.silver": "SILVER",
  "baseFeeExplanation.gold": "GOLD",
  "baseFeeExplanation.platinum": "PLATINUM",
  "baseFeeExplanation.diamond": "DIAMOND",
  "baseFeeExplanation.or": "OR",
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
  "colorSwatch.invalidCssFormat": "Invalid CSS format for {{displayName}}",
  "colorSwatch.notSet": "Not set",
  "colorSwatch.invalidFormat": "Invalid format",

  // CSSVariableInspector
  "cssVariableInspector.title": "CSS Variables",
  "cssVariableInspector.aiFineTuneOverrides": "AI Fine-Tune Overrides",
  "cssVariableInspector.cssPropertiesPlaceholder": "CSS properties...",
  "cssVariableInspector.aiFineTuneButton": "AI Fine-Tune This Element",
  "cssVariableInspector.aiFineTuneHint":
    "Use AI to customize this element and its children",
  "cssVariableInspector.noVariablesFound":
    "No CSS variables found for this element",

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
  "customDomainSection.yourSubdomain": "your subdomain",

  // CustomMenuEditor
  "customMenuEditor.title": "Custom Navigation Menus",
  "customMenuEditor.description":
    "Add custom navigation links that will appear in your DEX's navigation bar",
  "customMenuEditor.noMenusYet": "No custom menus yet",
  "customMenuEditor.addFirstLink":
    "Add your first custom navigation link to get started",
  "customMenuEditor.addFirstMenu": "Add First Menu",
  "customMenuEditor.dragToReorder": "Drag items to reorder",
  "customMenuEditor.menuName": "Menu Name",
  "customMenuEditor.menuNamePlaceholder": "e.g., Documentation",
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
  "seoConfigSection.siteLanguageHelp":
    "Language code: 'en', 'es', 'zh' or with region 'en-US', 'es-MX', 'zh-CN'",
  "seoConfigSection.siteLanguageFormat":
    "Format: 'en' or 'en-US' (2 lowercase letters, optionally hyphen + 2 uppercase letters)",
  "seoConfigSection.siteLocale": "Site Locale",
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
  "seoConfigSection.themeColorHelp":
    "Hex color for mobile browser theme (e.g., #1a1b23)",
  "seoConfigSection.clearThemeColor": "Clear theme color",
  "seoConfigSection.keywords": "Keywords",
  "seoConfigSection.keywordsHelp":
    "Comma-separated keywords for search engines (max 500 characters)",

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
  "pnlPostersSection.preview": "Preview",
  "pnlPostersSection.pnlSharing": "PnL Sharing",
  "pnlPostersSection.previewWidgetDescription":
    "Preview of PnL sharing widget with your custom backgrounds:",

  // TokenSelectionModal
  "tokenSelectionModal.loading": "Loading...",
  "tokenSelectionModal.save25Percent": "Save 25% (~${{amount}})",
  "tokenSelectionModal.usdCoinOnChain": "USD Coin on {{chainName}}",
  "tokenSelectionModal.orderTokenOnChain": "Order Token on {{chainName}}",
  "tokenSelectionModal.selectToken": "Select a token",
  "tokenSelectionModal.selected": "Selected",
  "tokenSelectionModal.graduation": "Graduation",

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
  "domainSetupGuideModal.cloudflareDesc":
    "Integrated DNS management, competitive pricing, fast setup",
  "domainSetupGuideModal.namecheapDesc":
    "Affordable domains, excellent support, user-friendly interface",
  "domainSetupGuideModal.steps": "Steps",
  "domainSetupGuideModal.step": "Step",
  "domainSetupGuideModal.stepOf": "Step {{current}} of {{total}}",
  "domainSetupGuideModal.previous": "Previous",
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
  "domainSetupGuideModal.recordsTellServers":
    "These records tell email servers that your domain doesn't send emails and to reject any emails claiming to be from your domain.",
  "domainSetupGuideModal.copyExactValues":
    "Copy these exact values to your DNS provider. Changes may take up to 24 hours to propagate.",

  // EditModeModal
  "editModeModal.holdCtrlToInspect":
    "Hold <0>Ctrl</0> + Click to inspect CSS variables",
  "editModeModal.presets": "Presets",
  "editModeModal.theme": "Theme",
  "editModeModal.ai": "AI",

  // FeeConfigWithCalculator
  "feeConfigWithCalculator.feeConfiguration": "Fee Configuration",
  "feeConfigWithCalculator.configure": "Configure",
  "feeConfigWithCalculator.feeConfigDesc":
    "Configure the trading fees for your DEX. Maker fees apply to limit orders that provide liquidity, while taker fees apply to market orders that take liquidity.",
  "feeConfigWithCalculator.importantFeeNoteBlock":
    "<0>Important Fee Note:</0> The fees you configure here are the <1>total fees</1> that traders will pay. This includes the Orderly base fee (varies by tier - see calculator below). Your revenue will be: <2>Your Custom Fee - Orderly Base Fee</2>.",
  "feeConfigWithCalculator.makerFeeLabel": "Maker Fee",
  "feeConfigWithCalculator.takerFeeLabel": "Taker Fee",
  "feeConfigWithCalculator.rwaAssetFees": "RWA Asset Fees",
  "feeConfigWithCalculator.rwaAssetFeesDesc":
    "Configure separate fees for Real World Asset (RWA) trading.",
  "feeConfigWithCalculator.rwaMakerFeeLabel": "RWA Maker Fee",
  "feeConfigWithCalculator.rwaTakerFeeLabel": "RWA Taker Fee",
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
  "feeConfigWithCalculator.standardFees": "Standard Fees",
  "feeConfigWithCalculator.makerFee": "Maker Fee",
  "feeConfigWithCalculator.takerFee": "Taker Fee",
  "feeConfigWithCalculator.rwaMakerFee": "RWA Maker Fee",
  "feeConfigWithCalculator.rwaTakerFee": "RWA Taker Fee",
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
  "interactivePreview.desktopPreviewPlaceholderTitle": "Desktop preview",
  "interactivePreview.desktopPreviewPlaceholderDescription":
    'Click "Edit Desktop" to view',
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

  // LanguageSupportSection
  "languageSupportSection.title": "Available Languages",
  "languageSupportSection.description":
    "Select the languages you want to support in your DEX interface.",
  "languageSupportSection.selectedCountLabel": "({{count}} selected)",
  "languageSupportSection.unselectAll": "Unselect All",
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

  // SwapFeeWithdrawalModal
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

  // NavigationMenuEditor
  "navigationMenuEditor.configuringOptional":
    "Configuring navigation menus is optional. If you don't select any menus, the default menus will be displayed.",
  "navigationMenuEditor.defaultNavigationIncludes":
    "Default navigation includes: Trading, Portfolio, Markets, and Leaderboard pages. The Rewards page includes referral management and trader incentives.",
  "navigationMenuEditor.dragItemsToReorder": "Drag items to reorder",
  "navigationMenuEditor.editFee": "Edit Fee",
  "navigationMenuEditor.setFee": "⚠️ Set Fee",
  "navigationMenuEditor.noMenuItemsSelected":
    "No menu items selected. Default menus will be displayed.",
  "navigationMenuEditor.swapPageFeatures": "Swap Page Features",
  "navigationMenuEditor.swapPageFeaturesDesc":
    "The Swap page allows users to exchange tokens seamlessly across multiple chains. Powered by WOOFi, this feature provides efficient token swapping with competitive rates and deep liquidity across supported networks.",
  "navigationMenuEditor.rewardsPageRequirement": "Rewards Page Requirement",
  "navigationMenuEditor.rewardsPageRequirementDesc":
    "The Rewards page (which includes referral management) can only be fully utilized after your DEX has been graduated. You can enable the Rewards menu now, but referral features will only become active once you graduate your DEX and start earning fee splits.",
  "navigationMenuEditor.vaultsPageFeatures": "Vaults Page Features",
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
  "reownConfigSection.keyBenefits": "🚀 Key Benefits for Your DEX Users",
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
  "privyConfigSection.signInWithX": "Sign in with X account",
  "privyConfigSection.requiresOAuth":
    "Requires OAuth setup in your Privy dashboard",
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

  // MLRConfirmModal
  "mlrConfirmModal.title": "Upgrade to Multi-Level Referral?",
  "mlrConfirmModal.confirmUpgrade": "Confirm & Upgrade",

  // OrderlyKeyLoginModal (toast messages)
  "orderlyKeyLoginModal.switchNetworkRequired":
    "Please switch to the required network in your wallet",
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

  // navigation (utils/navigation.tsx)
  "navigation.home": "Home",
  "navigation.board": "Board",
  "navigation.distributor": "Distributor",
  "navigation.menuOrder": "Menu Order",
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
