import { useTranslation } from "~/i18n";
import { useDex } from "~/context/DexContext";
import { Card } from "../Card";
import { Button } from "../Button";
import { cn } from "~/utils/css";

type GraduationAuthGuardProps = {
  children: React.ReactNode;
  className?: string;
};

export const GraduationAuthGuard = (props: GraduationAuthGuardProps) => {
  const { t } = useTranslation();
  const { isGraduated } = useDex();

  if (isGraduated) {
    return props.children;
  }

  return (
    <Card
      className={cn("border border-warning/20 bg-warning/5", props.className)}
    >
      <div className="flex gap-4 items-start">
        <div className="bg-warning/20 p-3 rounded-full flex-shrink-0">
          <div className="i-mdi:lock text-warning w-6 h-6"></div>
        </div>
        <div>
          <h3 className="text-lg font-medium text-warning mb-2">
            {t("graduationAuthGuard.title")}
          </h3>
          <p className="text-gray-300 mb-4">
            {t("graduationAuthGuard.description")}
          </p>

          <Button as="a" href="/dex/graduation" className="inline-flex">
            <div className="i-mdi:rocket-launch w-4 h-4"></div>
            {t("graduationAuthGuard.graduateButton")}
          </Button>
        </div>
      </div>
    </Card>
  );
};
