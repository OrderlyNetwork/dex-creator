/**
 * Referral Page and Sub-components
 * Corresponding to routes/_layout.referral
 */
export const referral = {
  // OrderlyKeyRequiredCard
  "referral.orderlyKeyRequired.title": "Orderly Key Required",
  "referral.orderlyKeyRequired.description":
    "To manage referral settings, you need to create an Orderly key that allows secure API access to the Orderly Network. This key will be stored locally and used for managing your referral program.",
  "referral.orderlyKeyRequired.creatingKey": "Creating Key...",
  "referral.orderlyKeyRequired.createKey": "Create Orderly Key",

  // Page Title and Navigation
  "referral.pageTitle": "Referral Settings",
  "referral.backToDexDashboard": "Back to DEX Dashboard",
  "referral.authRequired.title": "Authentication Required",
  "referral.authRequired.description":
    "Please connect your wallet and login to access referral settings.",

  // No DEX / Not Graduated
  "referral.noDex.title": "No DEX Found",
  "referral.noDex.description":
    "You need to create a DEX first before you can set up referrals.",
  "referral.createYourDex": "Create Your DEX",
  "referral.graduationRequired.title": "Graduation Required",
  "referral.graduationRequired.description":
    "Referral settings are only available for graduated DEXs. You need to graduate your DEX first to start earning revenue and enable referral programs.",
  "referral.graduationRequired.whyTitle": "Why graduation is required:",
  "referral.graduationRequired.reason1":
    "Referrals are tied to revenue sharing from trading fees",
  "referral.graduationRequired.reason2":
    "Graduated DEXs can offer rebates and rewards to traders",
  "referral.graduationRequired.reason3":
    "Ensures your DEX has the necessary infrastructure for referrals",
  "referral.graduationRequired.graduateCta": "Graduate Your DEX",

  // Preview before Graduation
  "referral.preview.title": "Preview: Referral Features",
  "referral.preview.intro":
    "Once your DEX is graduated, you'll have access to these referral management features:",
  "referral.preview.autoReferral.title": "Auto Referral Program",
  "referral.preview.autoReferral.description":
    "Set trading volume thresholds and automatic rebate rates",
  "referral.preview.revenueSharing.title": "Revenue Sharing",
  "referral.preview.revenueSharing.description":
    "Configure referrer and referee rebate percentages",
  "referral.preview.programManagement.title": "Program Management",
  "referral.preview.programManagement.description":
    "Enable/disable programs and update settings in real-time",
  "referral.preview.secureApi.title": "Secure API Access",
  "referral.preview.secureApi.description":
    "Manage settings through secure Orderly Network integration",
  "referral.preview.advancedDashboard.title": "Advanced Dashboard",
  "referral.preview.advancedDashboard.description":
    "Access to Orderly Admin Dashboard for creating custom referral codes and detailed analytics",

  // Type Switch and Loading
  "referral.type.singleLevel": "Single-level",
  "referral.type.multiLevel": "Multi-level",
  "referral.loading.settings": "Loading Referral Settings",
  "referral.loading.dashboard":
    "Please wait while we prepare your referral dashboard",
  "referral.loading.settingsInline": "Loading referral settings...",
  "referral.loading.generic": "Loading...",
  "referral.saving": "Saving...",

  // Toast
  "referral.toast.missingKeyInfo":
    "Missing required information for key creation",
  "referral.toast.createKeyFailed": "Failed to create orderly key",
  "referral.toast.orderlyKeyRequiredAdmin":
    "Orderly key required to access admin credentials",
  "referral.toast.orderlyKeyRequiredUpgrade":
    "Orderly key required to upgrade to multi-level referral",
  "referral.toast.mlrEnabled": "Multi-Level Referral enabled successfully",
  "referral.toast.mlrEnableFailed": "Failed to enable multi-level referral",

  // AdvancedReferralManagement
  "referral.advanced.title": "Advanced Referral Management",
  "referral.advanced.description":
    "For more advanced referral features, you can use the Orderly Admin Dashboard which provides additional tools for managing your referral program.",
  "referral.advanced.featuresTitle": "Additional features available:",
  "referral.advanced.feature1":
    "Create specific referral codes manually for targeted campaigns",
  "referral.advanced.feature2":
    "Detailed analytics and performance tracking for referrals",
  "referral.advanced.feature3":
    "Advanced user management and referral relationship tracking",
  "referral.advanced.feature4":
    "Fine-grained control over referral program parameters",
  "referral.advanced.openAdmin": "Open Admin Dashboard",
  "referral.advanced.getCredentials": "Get Login Credentials",
  "referral.advanced.credentialsHint":
    'Use the same wallet that you used to set up your DEX to access your broker settings in the admin dashboard. Click "Get Login Credentials" to copy the required keys and account ID for login.',

  // MultiLevelSettings
  "referral.multiLevel.keyRequiredUpdate":
    "Orderly key required to update settings",
  "referral.multiLevel.validVolume":
    "Please enter a valid minimum trading volume",
  "referral.multiLevel.validCommission":
    "Please enter a valid commission rate",
  "referral.multiLevel.commissionMax100":
    "Commission rate cannot exceed 100%",
  "referral.multiLevel.saved": "Referral settings updated successfully",
  "referral.multiLevel.saveFailed": "Failed to save multi-level settings",
  "referral.multiLevel.protectUsersNotice":
    "To protect existing users, you can only increase the default commission rate once referral codes are generated.",
  "referral.multiLevel.minVolumeLabel":
    "Minimum trading volume (USDC)",
  "referral.multiLevel.minVolumeHint":
    "Users must meet this volume requirement to generate referral codes. Set to 0 to allow all users.",
  "referral.multiLevel.defaultCommissionLabel": "Default commission rate",
  "referral.multiLevel.defaultCommissionHint":
    "Sets the base commission percentage for Level 1 affiliates. A {{directBonusPercent}}% fixed bonus is also paid to the direct referrer. Based on this setting, you will retain {{remainingPercent}}%.",
  "referral.multiLevel.saveButton": "Save Settings",
  "referral.multiLevel.upgradeTitle": "Upgrade to Multi-Level Referral",
  "referral.multiLevel.upgradeDescription":
    "Empower your Sub-affiliates with custom commission rates. Earn passive commissions from every trade made by Referees deep within your network.",
  "referral.multiLevel.upgradeCta": "Upgrade to Multi-Level",
  "referral.multiLevel.upgradeWarning.permanent":
    "This upgrade is permanent. You will not be able to switch back to Single-level referral.",
  "referral.multiLevel.upgradeWarning.noNewSingle":
    "You will no longer be able to create new Single-level referral codes.",
  "referral.multiLevel.upgradeWarning.existingRemain":
    "Your existing Single-level codes will remain editable and active.",

  // SingleLevelSettings
  "referral.singleLevel.maxRebateMin": "Max rebate must be greater than 0%",
  "referral.singleLevel.maxRebateMax": "Max rebate cannot exceed 100%",
  "referral.singleLevel.loadFailed": "Failed to load referral settings",
  "referral.singleLevel.cannotModifyWhenMlr":
    "Cannot modify Single-level settings when Multi-level Referral is enabled",
  "referral.singleLevel.keyRequiredSave":
    "Orderly key required to save settings",
  "referral.singleLevel.fixValidation":
    "Please fix validation errors before saving",
  "referral.singleLevel.saved": "Referral settings updated successfully!",
  "referral.singleLevel.saveFailed": "Failed to save referral settings",
  "referral.singleLevel.configTitle": "Auto Referral Configuration",
  "referral.singleLevel.configIntro":
    "Configure your automatic referral program settings. Users who meet the trading volume requirements will be automatically enrolled in your referral program.",
  "referral.singleLevel.autoProgram.title": "Auto Referral Program",
  "referral.singleLevel.autoProgram.hint":
    "Enable automatic enrollment for users who meet trading requirements",
  "referral.singleLevel.requiredVolumeLabel":
    "Required Trading Volume (USDC)",
  "referral.singleLevel.requiredVolumeHint":
    "Minimum trading volume required to join referral program",
  "referral.singleLevel.maxRebateLabel": "Max Rebate (%)",
  "referral.singleLevel.maxRebateHint":
    "Maximum rebate percentage for participants",
  "referral.singleLevel.referrerRebate": "Default referrer rebate",
  "referral.singleLevel.refereeRebate": "Default referee rebate",
  "referral.singleLevel.rebateSplitHint":
    "Adjust the split between referrer and referee rebates. Total rebate: {{maxRebate}}%",
  "referral.singleLevel.descriptionLabel": "Description",
  "referral.singleLevel.descriptionPlaceholder":
    "Describe your referral program...",
  "referral.singleLevel.saveButton": "Save Settings",
  "referral.singleLevel.currentSettings": "Current Settings",
  "referral.singleLevel.tradingVolumeRequired": "Trading Volume Required:",
  "referral.singleLevel.maxRebateDisplay": "Max Rebate:",
  "referral.singleLevel.referrerRebateDisplay": "Referrer Rebate:",
  "referral.singleLevel.refereeRebateDisplay": "Referee Rebate:",
  "referral.singleLevel.status": "Status:",
  "referral.singleLevel.statusEnabled": "Enabled",
  "referral.singleLevel.statusDisabled": "Disabled",
  "referral.singleLevel.mlrActivatedBanner":
    "Multi-Level Referral activated.",
};
