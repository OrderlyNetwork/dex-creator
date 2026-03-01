export const points = {
  "points.page.title": "Point Campaign Setup",
  "points.enableCard.title": "Enable Point System",
  "points.enableCard.description":
    "Once enabled, the point system will appear in the header and cannot be turned off for now.",
  "points.enableCard.toast.title": "Point system enabled",
  "points.enableCard.toast.description":
    "The feature will show on your DEX UI within 5 minutes.",
  "points.enableCard.toast.error": "Failed to enable point system",
  "points.list.column.stage": "Stage",
  "points.list.column.status": "Status",
  "points.list.column.title": "Title",
  "points.list.column.time": "Time",
  "points.list.column.action": "Action",
  "points.list.status.pending": "Ready to go",
  "points.list.status.active": "Ongoing",
  "points.list.status.completed": "Ended",
  "points.list.button.view": "View",
  "points.list.button.edit": "Edit",
  "points.list.button.delete": "Delete",
  "points.list.button.create": "Create",
  "points.list.tooltip.recurring":
    "Please set an end date for the last stage first.",
  "points.list.tooltip.enable":
    "Please enable the Point System first to create a campaign.",
  "points.list.title": "Point Campaign List",
  "points.list.empty": "No campaigns",
  "points.basic.title": "Basic information",
  "points.basic.campaignTitle.label": "Campaign Title",
  "points.basic.campaignTitle.placeholder": "Name your campaign title",
  "points.basic.stages.label": "Stages",
  "points.basic.stages.tooltip":
    "This default number will increase as more campaigns are created. The stage is mainly used to help organize and track data in the future.",
  "points.basic.description.label": "Description",
  "points.basic.description.placeholder": "Description...",
  "points.basic.startDate.help": "Starts at 00:00:00 UTC",
  "points.basic.endDate.label": "End Date (UTC)",
  "points.basic.endDate.tooltip":
    "You can leave the end time unset for now. Before creating a new campaign, please set the end date for the current one.",
  "points.basic.endDate.recurring": "Recurring",
  "points.basic.endDate.placeholder": "Select a date",
  "points.basic.endDate.help": "Ends at 23:59:59 UTC",
  "points.coefficient.title": "Coefficient",
  "points.coefficient.tradingVolume.label": "Trading volume",
  "points.coefficient.tradingVolume.help":
    "Trading points = perp_volume × {{volumeBoost}}",
  "points.coefficient.pnl.label": "PNL",
  "points.coefficient.pnl.tooltip":
    "The profit or loss of each trade will be recorded in absolute value.",
  "points.coefficient.pnl.help": "PNL points = |PNL| × {{pnlBoost}}",
  "points.coefficient.l1.label": "L1 Referral rate(%)",
  "points.coefficient.l1.tooltip":
    "Points earned from the first-level invitee's invitees",
  "points.coefficient.l1.help":
    "The first-level invitee's rebate inviter {{l1ReferralBoost}}% of their points",
  "points.coefficient.l2.label": "L2 Referral rate(%)",
  "points.coefficient.l2.tooltip": "Second-level referral rate percentage",
  "points.coefficient.l2.help":
    "The second-level invitee's rebate inviter {{l2ReferralBoost}}% of their points",
  "points.form.back": "Back to Point Campaign Setup",
  "points.form.create.title": "Create Your Points Campaign",
  "points.form.edit.title": "Edit Your Points Campaign",
  "points.form.view.title": "View Your Points Campaign",
  "points.form.save": "Save & Publish",
  "points.delete.toast.title": "Campaign deleted",
  "points.delete.toast.description":
    "The campaign has been successfully removed.",
  "points.delete.toast.error": "Campaign delete failed",
  "points.delete.modal.title": "Delete Campaign?",
  "points.delete.modal.ok": "Delete",
  "points.delete.modal.content":
    "Are you sure you want to delete this campaign? This action cannot be undone.",
  "points.operate.create.toast.title": "Campaign created successfully",
  "points.operate.create.toast.description":
    "You can now view and manage it in the campaign list.",
  "points.operate.edit.toast.title": "Campaign updated successfully",
  "points.operate.edit.toast.description":
    "It may take some time for changes to process.",
  "points.operate.error": "An error occurred",
  "points.operate.modal.title": "Publish Campaign?",
  "points.operate.modal.ok": "Confirm Publish",
  "points.operate.modal.content":
    "Please confirm that you want to publish this campaign. Once published, it cannot be deleted or withdrawn, but you may continue to modify its parameters.",
  "points.form.validation.campaignTitle.required": "Campaign title is required",
  "points.form.validation.campaignTitle.max":
    "Campaign title must be less than 40 characters",
  "points.form.validation.description.max":
    "Description must be less than 280 characters",
  "points.form.validation.startDate.required": "Start date is required",
  "points.form.validation.endDate.required": "End date is required",
  "points.form.validation.endDate.after": "End date must be after start date",
  "points.form.validation.volume.required": "Trading volume is required",
  "points.form.validation.volume.min": "Trading volume cannot be less than 0",
  "points.form.validation.pnl.required": "PNL is required",
  "points.form.validation.pnl.min": "PNL cannot be less than 0",
  "points.form.validation.l1.required": "L1 referral rate is required",
  "points.form.validation.l1.min": "L1 referral rate cannot be less than 0",
  "points.form.validation.l2.required": "L2 referral rate is required",
  "points.form.validation.l2.min": "L2 referral rate cannot be less than 0",
};
