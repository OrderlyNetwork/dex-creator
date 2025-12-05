import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useVerifyDistributorCode } from "../../hooks/useVanguard";
import type { ConfigureDistributorCodeModalUIProps } from "./ConfigureDistributorCodeModal.ui";
import { getDistributorUrl } from "../../utils";

export interface ConfigureDistributorCodeModalProps {
  open: boolean;
  onClose: () => void;
  currentCode: string;
  onSave: (code: string) => Promise<void>;
}

export const useConfigureDistributorCodeModalScript = (
  props: ConfigureDistributorCodeModalProps
): ConfigureDistributorCodeModalUIProps => {
  const { open, onClose, currentCode, onSave } = props;

  const [code, setCode] = useState(currentCode);
  const [validationCode, setValidationCode] = useState<string | null>(null);
  const [frontendError, setFrontendError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const silentValidationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { exists, isLoading } = useVerifyDistributorCode(validationCode);

  useEffect(() => {
    if (!open) {
      return;
    }
    setCode(currentCode);
    setValidationCode(null);
    setFrontendError(null);
  }, [open, currentCode]);

  const validateFrontend = useCallback((value: string) => {
    if (!/^[a-zA-Z0-9]*$/.test(value)) {
      return "Please only input alphanumeric characters.";
    }
    if (value.length < 4 || value.length > 10) {
      return "Distributor code must be 4-10 characters long.";
    }
    return null;
  }, []);

  const triggerBackendValidation = useCallback(
    (value: string) => {
      if (value === currentCode) {
        return;
      }

      const error = validateFrontend(value);
      setFrontendError(error);

      if (!error) {
        setValidationCode(value);
      } else {
        setValidationCode(null);
      }
    },
    [currentCode, validateFrontend]
  );

  const debouncedValidate = useCallback(
    (value: string) => {
      // Clear previous timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Set new timeout for validation
      debounceTimeoutRef.current = setTimeout(() => {
        const error = validateFrontend(value);
        setFrontendError(error);
      }, 300);
    },
    [validateFrontend]
  );

  const handleChange = useCallback(
    (value: string) => {
      const upperValue = value.toUpperCase();
      setCode(upperValue);

      // Clear error and backend validation state immediately
      setFrontendError(null);
      setValidationCode(null);

      // Clear previous silent validation timeout
      if (silentValidationTimeoutRef.current) {
        clearTimeout(silentValidationTimeoutRef.current);
        silentValidationTimeoutRef.current = null;
      }

      // Trigger debounced frontend validation
      debouncedValidate(upperValue);

      // Set 3s silent validation timeout
      silentValidationTimeoutRef.current = setTimeout(() => {
        triggerBackendValidation(upperValue);
        silentValidationTimeoutRef.current = null;
      }, 3000);
    },
    [debouncedValidate, triggerBackendValidation]
  );

  const handleBlur = useCallback(() => {
    // Clear debounce timeout and silent validation timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
    if (silentValidationTimeoutRef.current) {
      clearTimeout(silentValidationTimeoutRef.current);
      silentValidationTimeoutRef.current = null;
    }

    // Execute validation immediately
    triggerBackendValidation(code);
  }, [code, triggerBackendValidation]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        // Clear debounce timeout and silent validation timeout
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
          debounceTimeoutRef.current = null;
        }
        if (silentValidationTimeoutRef.current) {
          clearTimeout(silentValidationTimeoutRef.current);
          silentValidationTimeoutRef.current = null;
        }

        // Trigger validation logic when Enter is pressed
        triggerBackendValidation(code);
      }
    },
    [code, triggerBackendValidation]
  );

  const isCodeAvailable = !isLoading && validationCode === code && !exists;
  const isBackendError = !isLoading && validationCode === code && !!exists;

  const hasError = !!frontendError || isBackendError;
  const errorMessage =
    frontendError ||
    (isBackendError ? "This distributor code is not available." : null);

  const isValid = !hasError && isCodeAvailable && code !== currentCode;

  const handleConfirm = useCallback(async () => {
    if (!isValid || isSaving) {
      return;
    }
    try {
      setIsSaving(true);
      await onSave(code);
      onClose();
    } catch (error) {
      console.error("Failed to save distributor code:", error);
    } finally {
      setIsSaving(false);
    }
  }, [code, isValid, isSaving, onClose, onSave]);

  const urlPreviewText = useMemo(() => {
    if (hasError) {
      return "Invalid";
    }
    if (isBackendError) {
      return "Not available";
    }
    if (frontendError) {
      return "Invalid";
    }
    if (isLoading && validationCode) {
      return "Checking availability...";
    }
    return getDistributorUrl(code);
  }, [
    code,
    frontendError,
    hasError,
    isBackendError,
    isLoading,
    validationCode,
  ]);

  const isUrlInvalid =
    hasError || urlPreviewText === "Checking availability...";

  const showChecking = !!validationCode;

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (silentValidationTimeoutRef.current) {
        clearTimeout(silentValidationTimeoutRef.current);
      }
    };
  }, []);

  return {
    open,
    onClose,
    onConfirm: handleConfirm,
    code,
    onCodeChange: handleChange,
    onCodeBlur: handleBlur,
    onCodeKeyDown: handleKeyDown,
    hasError,
    errorMessage,
    isLoading,
    showChecking,
    urlPreviewText,
    isUrlInvalid,
    isValid,
    isSaving,
  };
};
