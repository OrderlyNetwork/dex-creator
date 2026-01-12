import { createContext, useContext, useState, ReactNode } from "react";

interface ThemeGenerationContextType {
  isGeneratingTheme: boolean;
  setIsGeneratingTheme: (value: boolean) => void;
}

const ThemeGenerationContext = createContext<
  ThemeGenerationContextType | undefined
>(undefined);

export function ThemeGenerationProvider({ children }: { children: ReactNode }) {
  const [isGeneratingTheme, setIsGeneratingTheme] = useState(false);

  return (
    <ThemeGenerationContext.Provider
      value={{
        isGeneratingTheme,
        setIsGeneratingTheme,
      }}
    >
      {children}
    </ThemeGenerationContext.Provider>
  );
}

export function useThemeGeneration() {
  const context = useContext(ThemeGenerationContext);
  if (context === undefined) {
    throw new Error(
      "useThemeGeneration must be used within a ThemeGenerationProvider"
    );
  }
  return context;
}
