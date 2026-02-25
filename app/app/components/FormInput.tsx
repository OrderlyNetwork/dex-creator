import {
  useState,
  ChangeEvent,
  FocusEvent,
  ReactNode,
  useEffect,
  useId,
} from "react";
import { useTranslation } from "~/i18n";

export type ValidationFunction = (value: string) => string | null;

export interface FormInputProps {
  id?: string;
  label?: string | ReactNode;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  helpText?: string | ReactNode;
  className?: string;
  required?: boolean;
  validator?: ValidationFunction;
  minLength?: number;
  maxLength?: number;
  onError?: (error: string | null) => void;
  showValidation?: boolean;
  pattern?: string;
  disabled?: boolean;
  suffix?: ReactNode;
}

export default function FormInput({
  id: providedId,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  helpText,
  className = "",
  required = false,
  validator,
  minLength,
  maxLength,
  onError,
  showValidation = true,
  pattern,
  disabled = false,
  suffix,
}: FormInputProps) {
  const generatedId = useId();
  const id = providedId || generatedId;
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const { t } = useTranslation();

  const getLabelText = () =>
    typeof label === "string" ? label : t("formInput.field");

  // Notify parent form about validation errors when they change
  useEffect(() => {
    if (onError) {
      onError(error);
    }
  }, [error, onError]);

  const validateInput = (value: string): string | null => {
    const labelText = getLabelText();

    // Check required first
    if (required && value.trim() === "") {
      return t("formInput.required", { label: labelText });
    }

    // Check min length
    if (minLength && value.trim().length < minLength) {
      return t("formInput.minLength", { label: labelText, minLength });
    }

    // Check max length
    if (maxLength && value.trim().length > maxLength) {
      return t("formInput.maxLength", { label: labelText, maxLength });
    }

    // Run custom validator if provided
    if (validator) {
      return validator(value);
    }

    if (pattern && !new RegExp(pattern).test(value)) {
      return t("formInput.invalidFormat", { label: labelText });
    }

    return null;
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    setTouched(true);
    const validationError = validateInput(e.target.value);
    setError(validationError);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e);

    // If field has been touched, validate on change too
    if (touched) {
      const validationError = validateInput(e.target.value);
      setError(validationError);
    }
  };

  // Validate when value changes
  useEffect(() => {
    if (touched && showValidation) {
      setError(validateInput(value));
    }
  }, [value, touched, t]);

  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={id} className="block text-sm font-bold mb-1 md:mb-2">
        {label}
      </label>

      <div className="flex items-center relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`w-full px-3 md:px-4 py-2 bg-dark/50 border ${
            error ? "border-error/50" : "border-light/10"
          } rounded-lg focus:ring-1 focus:ring-primary focus:border-primary text-sm md:text-base`}
          minLength={minLength}
          maxLength={maxLength}
          required={required}
          pattern={pattern}
          disabled={disabled}
        />
        {suffix}
      </div>

      {error && <p className="mt-1 text-xs text-error">{error}</p>}

      {helpText && !error && (
        <p className="mt-1 text-xs text-gray-400">{helpText}</p>
      )}
    </div>
  );
}
