import { i18n } from "~/i18n";

export type TimePeriod = "daily" | "weekly" | "30d" | "90d";

export const getTimePeriodString = (period: TimePeriod) => {
  switch (period) {
    case "daily":
      return i18n.t("board.period.daily");
    case "weekly":
      return i18n.t("board.period.weekly");
    case "30d":
      return i18n.t("board.period.30d");
    case "90d":
      return i18n.t("board.period.90d");
  }
};
