export type PointCampaign = {
  stage_id: number;
  epoch_period: number;
  start_time: number;
  end_time: number;
  status: string;
  stage_name: string;
  stage_description: string;
  is_continuous: boolean;
};

export type PointCampaignDetail = {
  stage_id: number;
  epoch_period: number;
  stage_name: string;
  stage_description: string;
  start_date: string;
  end_date: string;
  volume_boost: number;
  pnl_boost: number;
  l1_referral_boost: number;
  l2_referral_boost: number;
};

export type PointCampaignFormValues = {
  stage_name: string;
  stage_description: string;
  start_date?: Date;
  end_date?: Date;
  is_continuous: boolean;
  volume_boost: string;
  pnl_boost: string;
  l1_referral_boost: string;
  l2_referral_boost: string;
};

export type PointCampaignFormErrors = {
  [key in keyof PointCampaignFormValues]?: string;
};

export enum PointCampaignStatus {
  Pending = "pending",
  Active = "active",
  Completed = "completed",
}

export enum PointCampaignFormType {
  Create = "create",
  Edit = "edit",
  View = "view",
}
