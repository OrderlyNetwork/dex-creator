import { useState, useEffect, useRef, ChangeEvent } from "react";

interface FuzzySearchInputProps {
  placeholder?: string;
  initialValue?: string;
  value?: string;
  onSearch: (value: string) => void;
  className?: string;
  debounceTime?: number;
  disabled?: boolean;
  clearOnEscape?: boolean;
}

/**
 * A fuzzy search input component with debouncing
 */
export default function FuzzySearchInput({
  placeholder = "Search...",
  initialValue = "",
  value,
  onSearch,
  className = "",
  debounceTime = 300,
  disabled = false,
  clearOnEscape = true,
}: FuzzySearchInputProps) {
  const [internalValue, setInternalValue] = useState(initialValue);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Allow controlled usage with external value prop
  const currentValue = value !== undefined ? value : internalValue;

  // Update internal value when external value changes
  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  useEffect(() => {
    return () => {
      // Clean up any pending debounce on unmount
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);

    // Clear any existing timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Set new timeout for debouncing
    debounceTimeout.current = setTimeout(() => {
      onSearch(newValue);
    }, debounceTime);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow clearing the input with Escape key
    if (clearOnEscape && e.key === "Escape") {
      setInternalValue("");
      onSearch("");
      // Focus the input after clearing
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleClear = () => {
    setInternalValue("");
    onSearch("");
    // Focus the input after clearing
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className={`relative w-full ${className}`}>
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-1">
        <div className="i-mdi:magnify h-5 w-5 text-gray-400"></div>
      </div>
      <input
        ref={inputRef}
        type="text"
        className="border-light/10 bg-dark/20 backdrop-blur-sm text-white placeholder-gray-400 text-sm rounded-lg block w-full pl-10 pr-10 p-2.5 focus:ring-primary-light focus:border-primary-light focus:outline-none border"
        placeholder={placeholder}
        value={currentValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />
      {currentValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 flex items-center pr-3"
          disabled={disabled}
        >
          <div className="i-mdi:close-circle h-5 w-5 text-gray-400 hover:text-gray-200"></div>
        </button>
      )}
    </div>
  );
}
