/**
 * 校验相关文案（表单校验、Broker ID、Zod 错误等）
 */
export const validation = {
  "validation.required": "{{fieldName}} is required",
  "validation.urlInvalid": "Please enter a valid URL",
  "validation.minLength":
    "{{fieldName}} must be at least {{length}} characters",
  "validation.maxLength": "{{fieldName}} cannot exceed {{length}} characters",
  "validation.alphanumericWithSpecialChars":
    "{{fieldName}} can only contain letters, numbers, spaces, dots, hyphens, and underscores",
  "validation.alphanumeric": "{{fieldName}} can only contain letters, numbers",
  "validation.brokerIdMinLength": "Broker ID must be at least 5 characters",
  "validation.brokerIdMaxLength": "Broker ID cannot exceed 15 characters",
  "validation.brokerIdFormat":
    "Broker ID must contain only lowercase letters, numbers, hyphens, and underscores",
  "validation.brokerIdNoOrderly": "Broker ID cannot contain 'orderly'",
  "validation.brokerIdTaken":
    "This broker ID is already taken. Please choose another one.",
  "validation.errorOccurred": "An error occurred",
};
