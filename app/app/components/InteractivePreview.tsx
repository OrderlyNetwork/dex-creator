import { FC, useState } from "react";
import { createPortal } from "react-dom";
import { DexPreviewProps } from "./DexPreview";
import EditModeModal from "./EditModeModal";
import { Button } from "./Button";

export interface InteractivePreviewProps {
  previewProps: DexPreviewProps;
  currentTheme: string | null;
  defaultTheme: string;
  savedTheme: string | null;
  onThemeChange: (newTheme: string) => void;
  onGenerateTheme: (prompt: string, viewMode: "desktop" | "mobile") => void;
  updateCssColor?: (variableName: string, newColorHex: string) => void;
  updateCssValue?: (variableName: string, newValue: string) => void;
  tradingViewColorConfig?: string | null;
  setTradingViewColorConfig?: (config: string | null) => void;
}

const InteractivePreview: FC<InteractivePreviewProps> = ({
  previewProps,
  currentTheme,
  defaultTheme,
  savedTheme,
  onThemeChange,
  onGenerateTheme,
  updateCssColor,
  updateCssValue,
  tradingViewColorConfig,
  setTradingViewColorConfig,
}) => {
  const [editMode, setEditMode] = useState<"desktop" | "mobile" | null>(null);

  const handleOpenEditMode = (mode: "desktop" | "mobile") => {
    setEditMode(mode);
  };

  const handleCloseEditMode = () => {
    setEditMode(null);
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h3 className="text-base font-bold mb-2 text-gray-200">
            Interactive Preview
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Click "Edit Desktop" or "Edit Mobile" to enter edit mode and
            customize CSS variables by clicking on elements.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-background-card border border-light/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-300">
                Desktop Preview
              </h4>
            </div>
            <Button
              onClick={() => handleOpenEditMode("desktop")}
              variant="primary"
              size="md"
              className="w-full mb-3"
              type="button"
            >
              <span className="flex items-center gap-2 justify-center">
                <div className="i-mdi:pencil h-5 w-5"></div>
                Edit Desktop
              </span>
            </Button>
            <div
              className="relative border border-light/10 rounded overflow-hidden bg-background-dark flex items-center justify-center"
              style={{ height: "180px" }}
            >
              <div className="text-center text-gray-500">
                <div className="i-mdi:monitor-dashboard h-10 w-10 mx-auto mb-2 opacity-50"></div>
                <p className="text-xs">Desktop preview</p>
                <p className="text-xs opacity-70 mt-1">
                  Click "Edit Desktop" to view
                </p>
              </div>
            </div>
          </div>

          <div className="bg-background-card border border-light/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-300">
                Mobile Preview
              </h4>
            </div>
            <Button
              onClick={() => handleOpenEditMode("mobile")}
              variant="primary"
              size="md"
              className="w-full mb-3"
              type="button"
            >
              <span className="flex items-center gap-2 justify-center">
                <div className="i-mdi:pencil h-5 w-5"></div>
                Edit Mobile
              </span>
            </Button>
            <div
              className="relative border border-light/10 rounded overflow-hidden bg-background-dark mx-auto flex items-center justify-center"
              style={{ width: "100px", height: "180px" }}
            >
              <div className="text-center text-gray-500">
                <div className="i-mdi:cellphone h-6 w-6 mx-auto mb-2 opacity-50"></div>
                <p className="text-xs">Mobile preview</p>
                <p className="text-xs opacity-70 mt-1">
                  Click "Edit Mobile" to view
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {editMode &&
        typeof document !== "undefined" &&
        createPortal(
          <EditModeModal
            isOpen={true}
            onClose={handleCloseEditMode}
            previewProps={previewProps}
            currentTheme={currentTheme}
            defaultTheme={defaultTheme}
            savedTheme={savedTheme}
            onThemeChange={onThemeChange}
            viewMode={editMode}
            onGenerateTheme={
              editMode
                ? (prompt: string, vm: "desktop" | "mobile") => {
                    onGenerateTheme(prompt, vm);
                  }
                : undefined
            }
            updateCssColor={updateCssColor}
            updateCssValue={updateCssValue}
            tradingViewColorConfig={tradingViewColorConfig}
            setTradingViewColorConfig={setTradingViewColorConfig}
          />,
          document.body
        )}
    </>
  );
};

export default InteractivePreview;
