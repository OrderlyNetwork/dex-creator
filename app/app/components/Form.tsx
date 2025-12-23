import React, {
  FormEvent,
  ReactNode,
  useState,
  useCallback,
  useMemo,
  KeyboardEvent,
} from "react";
import { Button } from "./Button";
import FormInput from "./FormInput";
import { useRateLimitCountdown } from "../hooks/useRateLimitCountdown";

export type FormErrors = Record<string, string | null>;

interface FormProps {
  onSubmit: (e: FormEvent, errors: FormErrors) => void;
  children: ReactNode;
  submitText: string;
  isLoading?: boolean;
  loadingText?: string;
  disabled?: boolean;
  className?: string;
  enableRateLimit?: boolean;
}

/**
 * A form component that manages validation state for child inputs
 * and handles form submission with validation
 */
export default function Form({
  onSubmit,
  children,
  submitText,
  isLoading = false,
  loadingText = "Submitting",
  disabled = false,
  className = "",
  enableRateLimit = false,
}: FormProps) {
  const [errors, setErrors] = useState<FormErrors>({});

  const rateLimit = useRateLimitCountdown(enableRateLimit);
  const shouldShowRateLimit = rateLimit.isRateLimited;

  const registerError = useCallback(
    (fieldName: string, error: string | null) => {
      setErrors(prev => ({
        ...prev,
        [fieldName]: error,
      }));
    },
    []
  );

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      const submitEvent = e.nativeEvent as SubmitEvent;
      const submitter = submitEvent.submitter as HTMLElement | null;

      if (submitter) {
        const previewContainer = submitter.closest("[data-preview-container]");
        if (previewContainer) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
      }

      e.preventDefault();

      if (
        process.env.NODE_ENV === "development" &&
        (!e.nativeEvent || !e.nativeEvent.isTrusted)
      ) {
        console.log("Prevented automatic form submission during development");
        return;
      }

      onSubmit(e, errors);
    },
    [onSubmit, errors]
  );

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
      e.preventDefault();
    }
  };

  const childrenWithProps = useMemo(() => {
    return React.Children.map(children, child => {
      if (React.isValidElement(child)) {
        if (child.type === FormInput) {
          const inputProps = child.props as { id: string };

          if (inputProps.id) {
            return React.cloneElement(child, {
              onError: (error: string | null) =>
                registerError(inputProps.id, error),
            } as Partial<React.ComponentProps<typeof FormInput>>);
          }
        }
      }
      return child;
    });
  }, [children, registerError]);

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      className={className}
    >
      {childrenWithProps}

      {submitText && (
        <>
          {shouldShowRateLimit && (
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="i-mdi:clock-alert text-warning h-5 w-5"></div>
                <span className="text-warning font-medium">Please Wait</span>
              </div>
              <p className="text-sm text-gray-300 mb-2">
                You can only update your DEX once every 2 minutes.
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Time remaining:</span>
                <span className="font-mono text-warning font-bold">
                  {rateLimit.formattedTime}
                </span>
              </div>
            </div>
          )}

          <Button
            className="w-full justify-center max-w-md mxa"
            type="submit"
            variant="primary"
            size="md"
            disabled={disabled || isLoading || shouldShowRateLimit}
            isLoading={isLoading}
            loadingText={loadingText}
          >
            {shouldShowRateLimit
              ? `Wait ${rateLimit.formattedTime}`
              : submitText}
          </Button>
        </>
      )}
    </form>
  );
}
