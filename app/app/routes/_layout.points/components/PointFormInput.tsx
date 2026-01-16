import { ChangeEvent, ReactNode } from "react";
import { FormLabel } from "./FormLabel";
import { cn } from "../../../utils/css";

interface PointFormInputProps {
  label?: string;
  tooltip?: string;
  value: string;
  onChange?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: "text" | "textarea" | "number";
  placeholder?: string;
  disabled?: boolean;
  helpText?: string | ReactNode;
  classNames?: {
    root?: string;
    input?: string;
  };
  rows?: number;
  error?: boolean;
  errorMessage?: string;
}

export function PointFormInput({
  label,
  tooltip,
  value,
  onChange,
  type = "text",
  placeholder,
  disabled = false,
  helpText,
  classNames,
  rows = 4,
  error = false,
  errorMessage,
}: PointFormInputProps) {
  const baseInputClasses = cn(
    "w-full px-3 py-2.5 rounded-[6px] focus:ring-1 text-sm bg-base-6 border text-base-contrast",
    error
      ? "border-error focus:ring-error focus:border-error"
      : "border-transparent focus:ring-primary focus:border-primary"
  );

  const disabledClasses =
    "cursor-not-allowed bg-base-8 text-base-contrast-36 placeholder:text-base-contrast-36";

  const inputClasses = cn(
    baseInputClasses,
    disabled && disabledClasses,
    classNames?.input
  );

  return (
    <div className={cn("mb-4", classNames?.root)}>
      {label && <FormLabel label={label} tooltip={tooltip} />}
      {type === "textarea" ? (
        <textarea
          placeholder={placeholder}
          value={value}
          onChange={onChange || undefined}
          disabled={disabled}
          className={cn(inputClasses, "min-h-[100px] resize-y")}
          rows={rows}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            inputClasses,
            type === "number" &&
              "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          )}
        />
      )}
      {errorMessage && (
        <div className="flex items-center gap-1 mt-1 pl-1">
          <div className="w-1 h-1 rounded-full bg-error"></div>
          <p className="text-xs text-error leading-[18px] tracking-[0.36px]">
            {errorMessage}
          </p>
        </div>
      )}
      {helpText && !errorMessage && (
        <div className="flex items-center gap-1 mt-1 pl-1">
          <div className="w-1 h-1 rounded-full bg-base-contrast-54"></div>
          <p className="text-xs text-base-contrast-54 leading-[18px] tracking-[0.36px]">
            {helpText}
          </p>
        </div>
      )}
    </div>
  );
}
