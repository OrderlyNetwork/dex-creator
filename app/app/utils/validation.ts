import { ValidationFunction } from "../components/FormInput";

/**
 * Interface for Zod error structure
 */
interface ZodError {
  code: string;
  message: string;
  path: (string | number)[];
  [key: string]: unknown;
}

/**
 * Creates a required field validator
 * @param fieldName Name of the field to use in error message
 * @returns A validation function
 */
export const required =
  (fieldName: string): ValidationFunction =>
  (value: string) => {
    return value.trim() === "" ? `${fieldName} is required` : null;
  };

/**
 * Creates a URL validator
 * @param allowEmpty Whether empty values should pass validation
 * @returns A validation function
 */
export const validateUrl =
  (allowEmpty = true): ValidationFunction =>
  (value: string) => {
    if (allowEmpty && value.trim() === "") {
      return null;
    }

    try {
      // Check if URL is valid
      new URL(value);
      return null;
    } catch {
      return "Please enter a valid URL";
    }
  };

/**
 * Creates a minimum length validator
 * @param length Minimum required length
 * @param fieldName Name of the field to use in error message
 * @returns A validation function
 */
export const minLength =
  (length: number, fieldName: string): ValidationFunction =>
  (value: string) => {
    return value.trim().length < length
      ? `${fieldName} must be at least ${length} characters`
      : null;
  };

/**
 * Creates a maximum length validator
 * @param length Maximum allowed length
 * @param fieldName Name of the field to use in error message
 * @returns A validation function
 */
export const maxLength =
  (length: number, fieldName: string): ValidationFunction =>
  (value: string) => {
    return value.trim().length > length
      ? `${fieldName} cannot exceed ${length} characters`
      : null;
  };

/**
 * Creates an alphanumeric validator with allowed special characters
 * @param fieldName Name of the field to use in error message
 * @returns A validation function
 */
export const alphanumericWithSpecialChars =
  (fieldName: string): ValidationFunction =>
  (value: string) => {
    const regex = /^[a-zA-Z0-9 .\-_]*$/;
    return !regex.test(value.trim())
      ? `${fieldName} can only contain letters, numbers, spaces, dots, hyphens, and underscores`
      : null;
  };

/**
 * Creates a broker ID validator with length and format constraints
 * @param existingBrokerIds Array of existing broker IDs to check against
 * @returns A validation function for broker IDs
 */
export const validateBrokerId =
  (existingBrokerIds: string[] = []): ValidationFunction =>
  (value: string) => {
    const trimmedValue = value.trim();

    if (trimmedValue.length < 5) {
      return "Broker ID must be at least 5 characters";
    }

    if (trimmedValue.length > 15) {
      return "Broker ID cannot exceed 15 characters";
    }

    if (!/^[a-z0-9_-]+$/.test(trimmedValue)) {
      return "Broker ID must contain only lowercase letters, numbers, hyphens, and underscores";
    }

    if (trimmedValue.includes("orderly")) {
      return "Broker ID cannot contain 'orderly'";
    }

    if (existingBrokerIds.includes(trimmedValue)) {
      return "This broker ID is already taken. Please choose another one.";
    }

    return null;
  };

/**
 * Parses Zod validation errors from API error responses
 * @param errorResponse The error response from the API
 * @returns A user-friendly error message or the original message if not a Zod error
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseZodError = (errorResponse: any): string => {
  if (errorResponse.success === false && errorResponse.error?.issues) {
    const issues = errorResponse.error.issues;
    if (Array.isArray(issues) && issues.length > 0) {
      return issues[0].message;
    }
  }

  if (errorResponse.message === "Invalid request body" && errorResponse.error) {
    try {
      const zodErrors: ZodError[] = JSON.parse(errorResponse.error);
      if (Array.isArray(zodErrors) && zodErrors.length > 0) {
        return zodErrors[0].message;
      }
    } catch {
      return errorResponse.error;
    }
  }

  return errorResponse.message || "An error occurred";
};

/**
 * Combines multiple validators into one
 * @param validators Array of validation functions
 * @returns A validation function that runs all validators and returns the first error
 */
export const composeValidators =
  (...validators: ValidationFunction[]): ValidationFunction =>
  (value: string) => {
    for (const validator of validators) {
      const error = validator(value);
      if (error) return error;
    }
    return null;
  };

/**
 * Creates an optional minimum length validator
 * @param length Minimum required length
 * @param fieldName Name of the field to use in error message
 * @returns A validation function
 */
export const optionalMinLength =
  (length: number, fieldName: string): ValidationFunction =>
  (value: string) => {
    if (value && value.trim().length < length) {
      return `${fieldName} must be at least ${length} characters`;
    }
    return null;
  };

/**
 * only letters or digits
 * @param fieldName Name of the field to use in error message
 * @returns A validation function
 */
export const alphanumeric =
  (fieldName: string): ValidationFunction =>
  (value: string) => {
    const regex = /^[a-zA-Z0-9]*$/;
    return !regex.test(value.trim())
      ? `${fieldName} can only contain letters, numbers`
      : null;
  };
