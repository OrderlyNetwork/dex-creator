import { useMemo, HTMLAttributeAnchorTarget, ReactNode } from "react";
import { useDistributor } from "../context/DistributorContext";
import { useTranslation } from "~/i18n";
export interface NavItem {
  path: string;
  title: ReactNode;
  icon?: ReactNode;
  target?: HTMLAttributeAnchorTarget | undefined;
}

export function useNavigationMenu() {
  const { isAmbassador } = useDistributor();
  const { t } = useTranslation();

  const navigationItems = useMemo(() => {
    return [
      {
        path: "/",
        title: t("navigation.home"),
      },
      {
        path: "/board",
        title: t("navigation.board"),
      },
      {
        path: "/case-studies",
        title: t("navigation.caseStudies"),
      },
      {
        path: "/distributor",
        title: t("navigation.distributor"),
      },
      {
        path: "/dex",
        title: t("navigation.myDex"),
      },
    ] as NavItem[];
  }, [t]);

  const menuItems = useMemo(() => {
    if (isAmbassador) {
      return navigationItems.filter(item => item.path !== "/dex");
    }
    return navigationItems;
  }, [navigationItems, isAmbassador]);

  return menuItems;
}
