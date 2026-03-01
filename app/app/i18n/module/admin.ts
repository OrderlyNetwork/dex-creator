/** Admin 页面文案 */
export const admin = {
  "admin.unknownChain": "Unknown",
  "admin.redeployModal.title": "Redeploy DEX",
  "admin.redeployModal.message":
    'Are you sure you want to trigger a redeployment for "{{brokerName}}"?',
  "admin.redeployModal.warningMessage":
    "This will redeploy the DEX to GitHub Pages. The process may take several minutes to complete, but the current version will remain available during deployment.",
  "admin.redeploySuccess": "Redeployment triggered for {{brokerName}}",
  "admin.redeployError": "Failed to trigger redeployment",
  "admin.redeployErrorWithMessage":
    "Failed to trigger redeployment: {{message}}",
  "admin.customDomainOverrideError": "Failed to update custom domain override",
  "admin.customDomainOverrideErrorWithMessage":
    "Failed to update custom domain override: {{message}}",
  "admin.loadAdminUsersError": "Failed to load admin users",
  "admin.selectDexToDelete": "Please select a DEX to delete",
  "admin.selectedDex": "Selected DEX",
  "admin.deleteModal.message":
    'Are you sure you want to delete "{{dexName}}"? This action cannot be undone.',
  "admin.deleteModal.warningMessage":
    "Deleting this DEX will permanently remove all associated data from the system, including the GitHub repository. However, any deployed instances on GitHub Pages will remain active and must be manually disabled through GitHub.",
  "admin.deleteSuccess": "DEX deleted successfully",
  "admin.unknownError": "An unknown error occurred",
  "admin.enterDexId": "Please enter a DEX ID",
  "admin.enterBrokerId": "Please enter a Broker ID",
  "admin.updateBrokerModal.message":
    'Are you sure you want to update the broker ID for "{{dexName}}" from "{{currentBrokerId}}" to "{{newBrokerId}}"?',
  "admin.updateBrokerModal.warningMessage":
    "Updating the broker ID will affect the DEX's integration with the Orderly Network. This change will be immediate and may impact trading functionality.",
  "admin.currentLabel": "Current",
  "admin.currentRepository": "Current Repository",
  "admin.brokerUpdatedSuccess": "Broker ID updated successfully",
  "admin.enterNewRepoName": "Please enter a new repository name",
  "admin.renameRepoModal.message":
    'Are you sure you want to rename the repository for "{{dexName}}" from "{{currentRepoName}}" to "{{newRepoName}}"?',
  "admin.renameRepoModal.warningMessage":
    "Renaming the repository will update all references including the deployment URL. This may cause temporary downtime during the transition.",
  "admin.renameRepoModal.confirmButtonText": "Rename Repository",
  "admin.renameRepoSuccess": "Repository renamed successfully",
  "admin.selectDex": "Please select a DEX",
  "admin.enterBrokerIdLower": "Please enter a broker ID",
  "admin.enterTxHash": "Please enter a transaction hash",
  "admin.createBrokerModal.title": "Create Broker ID Manually",
  "admin.createBrokerModal.message":
    'Are you sure you want to manually create broker ID "{{brokerId}}" for "{{dexName}}"?',
  "admin.createBrokerModal.warningMessage":
    "This will create the broker ID on-chain without requiring payment verification. The DEX will be graduated automatically and fees will be set as specified.",
  "admin.createBrokerModal.confirmButtonText": "Create Broker ID",
  "admin.unknownDex": "Unknown DEX",
  "admin.brokerIdFormatError":
    "Broker ID must contain only lowercase letters, numbers, hyphens, and underscores",
  "admin.brokerIdCannotOrderly": "Broker ID cannot contain 'orderly'",
  "admin.brokerIdLengthError": "Broker ID must be between 5-15 characters",
  "admin.brokerIdAlreadyTaken":
    "This broker ID is already taken. Please choose another one.",
  "admin.checkingAdminStatus": "Checking admin status...",
  "admin.adminTools": "Admin Tools",
  "admin.accessDenied": "⚠️ Access Denied",
  "admin.noAdminPrivileges":
    "You don't have admin privileges to access this page.",
  "admin.adminOnlyWarning": "⚠️ Warning: Admin Only Area",
  "admin.adminOnlyDescription":
    "This page contains tools for administrators only. Improper use can result in data loss.",
  "admin.adminUsers": "Admin Users",
  "admin.refreshAdminList": "Refresh admin list",
  "admin.adminUsersDescription": "List of users with admin privileges.",
  "admin.loadingAdmins": "Loading admins...",
  "admin.address": "Address",
  "admin.addedOn": "Added On",
  "admin.noAdminUsersFound": "No admin users found.",
  "admin.brokerIdManagement": "Broker ID Management",
  "admin.refreshStats": "Refresh stats",
  "admin.brokerIdManagementDescription":
    "Manage broker ID configurations and fee settings for DEXs. Graduation is now automated - users can graduate their DEX by sending ORDER tokens.",
  "admin.quickStats": "Quick Stats",
  "admin.activeBrokerIds": "Active Broker IDs",
  "admin.updateBrokerId": "Update Broker ID",
  "admin.updateBrokerIdDescription":
    "Update the broker ID for a specific DEX. This affects the DEX's integration with the Orderly Network.",
  "admin.searchDex": "Search DEX",
  "admin.searchPlaceholderBroker":
    "Search by DEX ID, broker name, or broker ID...",
  "admin.currentBrokerIdLabel": "Current Broker ID",
  "admin.noDexsFound": "No DEXs found matching your search.",
  "admin.newBrokerIdLabel": "New Broker ID",
  "admin.dexIdHelp": "Enter the UUID of the DEX to update",
  "admin.newBrokerIdHelp": "Enter the new broker ID (1-50 characters)",
  "admin.renameRepoDescription":
    "Rename the GitHub repository for a DEX. This will update all references including the deployment URL.",
  "admin.searchPlaceholderRepo":
    "Search by DEX ID, broker name, or repository URL...",
  "admin.repoLabel": "Repo",
  "admin.newRepositoryName": "New Repository Name",
  "admin.newRepoNameHelp": "Lowercase letters, numbers, and hyphens only",
  "admin.renaming": "Renaming...",
  "admin.dangerZoneDescription":
    "Danger zone! This tool will <0>permanently delete a DEX</0> and all associated data. This action <1>cannot be undone</1>.",
  "admin.searchPlaceholderDelete":
    "Search by wallet address, broker name, broker ID, or DEX ID...",
  "admin.dexIdOrSearchHelp":
    "Enter the DEX ID or use the search above to find a DEX",
  "admin.manualBrokerCreation": "Manual Broker Creation",
  "admin.manualBrokerDescription":
    "Create a broker ID manually for any user without requiring payment verification. A transaction hash must be provided as proof of some transaction, but it won't be validated.",
  "admin.searchPlaceholderManual":
    "Search by DEX ID, broker name, or wallet address...",
  "admin.noEligibleDexsFound":
    "No eligible DEXs found. DEX must have a repository and no existing broker ID.",
  "admin.dexIdForHelp": "DEX ID for: {{selectedDexName}}",
  "admin.dexIdAutoFilledHelp":
    "DEX ID (auto-filled when selecting a DEX from search)",
  "admin.brokerIdHelp":
    "5-15 characters, lowercase letters, numbers, hyphens, and underscores only. Cannot contain 'orderly'",
  "admin.transactionHash": "Transaction Hash",
  "admin.txHashHelp":
    "Transaction hash as proof (will not be validated for payment)",
  "admin.chainOptional": "Chain (Optional)",
  "admin.selectChainOptional": "Select chain (optional)",
  "admin.mainnet": "Mainnet",
  "admin.chainHelp":
    "Select the chain where the transaction occurred (ORDER/USDC available chains)",
  "admin.tradingFeeConfig": "Trading Fee Configuration",
  "admin.configureFeesDescription": "Configure the trading fees for this DEX.",
  "admin.standardFees": "Standard Fees",
  "admin.makerFee": "Maker Fee",
  "admin.takerFee": "Taker Fee",
  "admin.rwaAssetFees": "RWA Asset Fees",
  "admin.rwaFeesDescription":
    "Configure separate fees for Real World Asset (RWA) trading.",
  "admin.rwaMakerFee": "RWA Maker Fee",
  "admin.rwaTakerFee": "RWA Taker Fee",
  "admin.feeCalculation": "Fee Calculation",
  "admin.standardLabel": "Standard",
  "admin.rwaLabel": "RWA",
  "admin.makerFeeLine": "• Maker Fee: {{makerFee}} bps ({{makerFeePct}}%)",
  "admin.takerFeeLine": "• Taker Fee: {{takerFee}} bps ({{takerFeePct}}%)",
  "admin.rwaMakerFeeLine":
    "• RWA Maker Fee: {{rwaMakerFee}} bps ({{rwaMakerFeePct}}%)",
  "admin.rwaTakerFeeLine":
    "• RWA Taker Fee: {{rwaTakerFee}} bps ({{rwaTakerFeePct}}%)",
  "admin.creatingBrokerId": "Creating broker ID...",
  "admin.brokerIdCreatedSuccess": "Broker ID created successfully",
  "admin.brokerIdLabel": "Broker ID",
  "admin.noneLabel": "None",
  "admin.fetchBrokerIdsError": "Failed to fetch broker IDs",
  "admin.transactionHashesLabel": "Transaction Hashes",
};
