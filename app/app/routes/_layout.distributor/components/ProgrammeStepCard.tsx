import { Card } from "../../../components/Card";

interface ProgrammeStepCardProps {
  icon: string;
  title: string;
  description: string;
}

export function ProgrammeStepCard({
  icon,
  title,
  description,
}: ProgrammeStepCardProps) {
  return (
    <Card className="min-h-[280px] md:h-[280px] p-6 md:p-8 flex flex-col gap-4 md:gap-5 items-start grow basis-0 w-full md:w-auto">
      <img src={icon} alt={title} className="w-20 h-20 object-contain" />
      <div className="flex flex-col gap-4 md:gap-5 items-start w-full">
        <h3 className="text-xl md:text-2xl leading-[1.2] text-base-contrast w-full">
          {title}
        </h3>
        <p className="text-sm md:text-sm leading-[1.5] text-base-contrast-54 w-full">
          {description}
        </p>
      </div>
    </Card>
  );
}
