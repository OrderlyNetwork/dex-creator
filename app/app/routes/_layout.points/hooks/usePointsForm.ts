import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { formatDate } from "~/utils/date";
import {
  PointCampaignDetail,
  PointCampaignFormValues,
  PointCampaignFormType,
  PointCampaignFormErrors,
} from "~/types/points";
import { useTranslation } from "~/i18n";

type UsePointsFormProps = {
  type: PointCampaignFormType;
  pointDetail?: PointCampaignDetail | null;
};

const initialFormValues: PointCampaignFormValues = {
  stage_name: "",
  stage_description: "",
  start_date: undefined,
  end_date: undefined,
  is_continuous: false,
  volume_boost: "0.1",
  pnl_boost: "1",
  l1_referral_boost: "10",
  l2_referral_boost: "5",
};

export function usePointsForm({ type, pointDetail }: UsePointsFormProps) {
  const [values, setValues] = useState<PointCampaignFormValues>({
    ...initialFormValues,
  });
  const [errors, setErrors] = useState<PointCampaignFormErrors>({});

  const { t } = useTranslation();

  const clearError = (field: keyof PointCampaignFormErrors) => {
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const setValue = <K extends keyof PointCampaignFormValues>(
    field: K,
    value: PointCampaignFormValues[K]
  ) => {
    setValues(prev => ({ ...prev, [field]: value }));
    clearError(field);
  };

  // Initialize form from pointDetail when editing/viewing
  useEffect(() => {
    if (type !== PointCampaignFormType.Create && pointDetail) {
      const {
        stage_name,
        stage_description,
        start_date,
        end_date,
        volume_boost,
        pnl_boost,
        l1_referral_boost,
        l2_referral_boost,
      } = pointDetail;

      setValues({
        stage_name,
        stage_description,
        start_date: start_date ? new Date(start_date) : undefined,
        end_date: end_date ? new Date(end_date) : undefined,
        is_continuous: !end_date,
        volume_boost: volume_boost?.toString() || "0.1",
        pnl_boost: pnl_boost?.toString() || "1",
        l1_referral_boost: l1_referral_boost?.toString() || "10",
        l2_referral_boost: l2_referral_boost?.toString() || "5",
      });
    }
  }, [type, pointDetail]);

  // Clear form when type changes
  useEffect(() => {
    if (!type) {
      setValues({ ...initialFormValues });
      setErrors({});
    }
  }, [type]);

  const validateForm = (): boolean => {
    const newErrors: PointCampaignFormErrors = {};

    if (values.stage_name?.trim() === "") {
      newErrors.stage_name = t("points.form.validation.campaignTitle.required");
    }

    const stageNameLength = values.stage_name?.trim()?.length || 0;
    if (stageNameLength > 40) {
      newErrors.stage_name = t("points.form.validation.campaignTitle.max");
    }

    const descriptionLength = values.stage_description?.trim()?.length || 0;
    if (descriptionLength > 280) {
      newErrors.stage_description = t("points.form.validation.description.max");
    }

    if (values.start_date === undefined) {
      newErrors.start_date = t("points.form.validation.startDate.required");
    }

    if (!values.is_continuous) {
      if (values.end_date === undefined) {
        newErrors.end_date = t("points.form.validation.endDate.required");
      } else if (values.start_date) {
        const startTime = `${formatDate(
          values.start_date,
          "yyyy-MM-dd"
        )}T00:00:00Z`;
        const endTime = `${formatDate(values.end_date, "yyyy-MM-dd")}T23:59:59Z`;

        if (endTime < startTime) {
          newErrors.end_date = t("points.form.validation.endDate.after");
        }
      }
    }

    if (values.volume_boost === "") {
      newErrors.volume_boost = t("points.form.validation.volume.required");
    } else if (Number(values.volume_boost) < 0) {
      newErrors.volume_boost = t("points.form.validation.volume.min");
    }
    if (values.pnl_boost === "") {
      newErrors.pnl_boost = t("points.form.validation.pnl.required");
    } else if (Number(values.pnl_boost) < 0) {
      newErrors.pnl_boost = t("points.form.validation.pnl.min");
    }
    if (values.l1_referral_boost === "") {
      newErrors.l1_referral_boost = t("points.form.validation.l1.required");
    } else if (Number(values.l1_referral_boost) < 0) {
      newErrors.l1_referral_boost = t("points.form.validation.l1.min");
    }
    if (values.l2_referral_boost === "") {
      newErrors.l2_referral_boost = t("points.form.validation.l2.required");
    } else if (Number(values.l2_referral_boost) < 0) {
      newErrors.l2_referral_boost = t("points.form.validation.l2.min");
    }

    setErrors(newErrors);
    const keys = Object.keys(newErrors);
    if (keys.length > 0) {
      toast.error(newErrors[keys[0] as keyof PointCampaignFormErrors]);
      return false;
    }

    return true;
  };

  return {
    values,
    errors,
    setValue,
    validateForm,
  };
}
