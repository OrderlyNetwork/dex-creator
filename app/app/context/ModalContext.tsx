import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
  useCallback,
} from "react";
import LoginModal from "../components/LoginModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import ConfirmationModal from "../components/ConfirmationModal";
import ImageCropModal from "../components/ImageCropModal";
import ThemePreviewModal from "../components/ThemePreviewModal";
import TradingViewLicenseModal from "../components/TradingViewLicenseModal";
import TradingViewLicenseAcknowledgmentModal from "../components/TradingViewLicenseAcknowledgmentModal";
import OrderlyKeyLoginModal from "../components/OrderlyKeyLoginModal";
import AdminLoginModal from "../components/AdminLoginModal";
import GraduationExplanationModal from "../components/GraduationExplanationModal";
import DomainSetupGuideModal from "../components/DomainSetupGuideModal";
import { TokenSelectionModal } from "../components/TokenSelectionModal";
import SafeInstructionsModal from "../components/SafeInstructions";
import { FeeWithdrawalModal } from "../components/FeeWithdrawalModal";
import SwapFeeConfigModal from "../components/SwapFeeConfigModal";
import { SwapFeeWithdrawalModal } from "../components/SwapFeeWithdrawalModal";
import ThemeEditorModal from "../components/ThemeEditorModal";
import AIThemeGeneratorModal from "../components/AIThemeGeneratorModal";
import CurrentThemeModal from "../components/CurrentThemeModal";
import AIFineTuneModal from "../components/AIFineTuneModal";
import AIFineTunePreviewModal from "../components/AIFineTunePreviewModal";
import ThemePresetPreviewModal from "../components/ThemePresetPreviewModal";

export type ModalType =
  | "login"
  | "deleteConfirm"
  | "confirmation"
  | "imageCrop"
  | "themePreview"
  | "tradingViewLicense"
  | "tradingViewLicenseAcknowledgment"
  | "orderlyKeyLogin"
  | "adminLogin"
  | "graduationExplanation"
  | "domainSetupGuide"
  | "tokenSelection"
  | "safeInstructions"
  | "feeWithdrawal"
  | "swapFeeConfig"
  | "swapFeeWithdrawal"
  | "themeEditor"
  | "aiThemeGenerator"
  | "currentTheme"
  | "aiFineTune"
  | "aiFineTunePreview"
  | "themePresetPreview"
  | null;

interface ModalContextType {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  openModal: (type: ModalType, props?: Record<string, any>) => void;
  closeModal: () => void;
  isModalOpen: boolean;
  currentModalType: ModalType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentModalProps: Record<string, any>;
}

const defaultModalContext: ModalContextType = {
  openModal: () => {},
  closeModal: () => {},
  isModalOpen: false,
  currentModalType: null,
  currentModalProps: {},
};

const ModalContext = createContext<ModalContextType>(defaultModalContext);

export const useModal = () => useContext(ModalContext);

interface ModalProviderProps {
  children: ReactNode;
}

export function ModalProvider({ children }: ModalProviderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentModalType, setCurrentModalType] = useState<ModalType>(null);
  const [currentModalProps, setCurrentModalProps] = useState<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Record<string, any>
  >({});

  const openModal = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (type: ModalType, props: Record<string, any> = {}) => {
      setIsModalOpen(true);
      setCurrentModalType(type);
      setCurrentModalProps(props);
    },
    []
  );

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => {
      setCurrentModalType(null);
      setCurrentModalProps({});
    }, 300);
  }, []);

  const contextValue = useMemo(
    () => ({
      openModal,
      closeModal,
      isModalOpen,
      currentModalType,
      currentModalProps,
    }),
    [openModal, closeModal, isModalOpen, currentModalType, currentModalProps]
  );

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
      <ModalManager />
    </ModalContext.Provider>
  );
}

function ModalManager() {
  const { isModalOpen, currentModalType, currentModalProps, closeModal } =
    useModal();

  if (!isModalOpen || !currentModalType) return null;

  switch (currentModalType) {
    case "login":
      return (
        <LoginModal
          isOpen={isModalOpen}
          onClose={currentModalProps.onClose || closeModal}
          onLogin={currentModalProps.onLogin}
        />
      );
    case "deleteConfirm":
      return (
        <DeleteConfirmModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onConfirm={currentModalProps.onConfirm}
          entityName={currentModalProps.entityName || "Item"}
        />
      );
    case "confirmation":
      return (
        <ConfirmationModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onConfirm={currentModalProps.onConfirm}
          title={currentModalProps.title || "Confirm Action"}
          message={
            currentModalProps.message || "Are you sure you want to proceed?"
          }
          warningMessage={currentModalProps.warningMessage}
          confirmButtonText={currentModalProps.confirmButtonText || "Confirm"}
          confirmButtonVariant={
            currentModalProps.confirmButtonVariant || "primary"
          }
          cancelButtonText={currentModalProps.cancelButtonText || "Cancel"}
          isDestructive={currentModalProps.isDestructive || false}
        />
      );
    case "imageCrop":
      return (
        <ImageCropModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onApply={currentModalProps.onApply}
          imageSource={currentModalProps.imageSource}
          originalDimensions={currentModalProps.originalDimensions}
          initialCrop={currentModalProps.initialCrop}
          targetDimensions={currentModalProps.targetDimensions}
          enforceSquare={currentModalProps.enforceSquare}
          enforce16by9={currentModalProps.enforce16by9}
        />
      );
    case "themePreview":
      return (
        <ThemePreviewModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onApply={modifiedCss => {
            if (currentModalProps.onApply) {
              currentModalProps.onApply(modifiedCss);
            }
            closeModal();
          }}
          onCancel={currentModalProps.onCancel}
          oldTheme={currentModalProps.oldTheme}
          themes={currentModalProps.themes}
          previewProps={currentModalProps.previewProps}
          viewMode={currentModalProps.viewMode}
        />
      );
    case "tradingViewLicense":
      return (
        <TradingViewLicenseModal isOpen={isModalOpen} onClose={closeModal} />
      );
    case "tradingViewLicenseAcknowledgment":
      return (
        <TradingViewLicenseAcknowledgmentModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onAcknowledge={currentModalProps.onAcknowledge}
          onViewGuide={currentModalProps.onViewGuide}
        />
      );
    case "orderlyKeyLogin":
      return (
        <OrderlyKeyLoginModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSuccess={currentModalProps.onSuccess}
          onCancel={currentModalProps.onCancel}
          brokerId={currentModalProps.brokerId}
          accountId={currentModalProps.accountId}
        />
      );
    case "adminLogin":
      return (
        <AdminLoginModal
          isOpen={isModalOpen}
          onClose={closeModal}
          orderlyKey={currentModalProps.orderlyKey}
          accountId={currentModalProps.accountId}
        />
      );
    case "graduationExplanation":
      return (
        <GraduationExplanationModal isOpen={isModalOpen} onClose={closeModal} />
      );
    case "domainSetupGuide":
      return (
        <DomainSetupGuideModal
          isOpen={isModalOpen}
          onClose={closeModal}
          customDomain={currentModalProps.customDomain}
        />
      );
    case "tokenSelection":
      return (
        <TokenSelectionModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSelect={currentModalProps.onSelect}
          currentChain={currentModalProps.currentChain}
          currentPaymentType={currentModalProps.currentPaymentType}
        />
      );
    case "safeInstructions":
      return (
        <SafeInstructionsModal
          isOpen={isModalOpen}
          onClose={closeModal}
          brokerId={currentModalProps.brokerId}
          chainId={currentModalProps.chainId}
        />
      );
    case "feeWithdrawal":
      return (
        <FeeWithdrawalModal
          isOpen={isModalOpen}
          onClose={closeModal}
          brokerId={currentModalProps.brokerId}
          multisigAddress={currentModalProps.multisigAddress}
          multisigChainId={currentModalProps.multisigChainId}
        />
      );
    case "swapFeeConfig":
      return (
        <SwapFeeConfigModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSave={currentModalProps.onSave}
          currentFeeBps={currentModalProps.currentFeeBps}
        />
      );
    case "swapFeeWithdrawal":
      return (
        <SwapFeeWithdrawalModal
          isOpen={isModalOpen}
          onClose={closeModal}
          address={currentModalProps.address}
        />
      );
    case "themeEditor":
      return (
        <ThemeEditorModal
          isOpen={isModalOpen}
          onClose={closeModal}
          currentTheme={currentModalProps.currentTheme}
          defaultTheme={currentModalProps.defaultTheme}
          savedTheme={currentModalProps.savedTheme}
          onThemeChange={currentModalProps.onThemeChange}
        />
      );
    case "aiThemeGenerator":
      return (
        <AIThemeGeneratorModal
          isOpen={isModalOpen}
          onClose={closeModal}
          isGeneratingTheme={currentModalProps.isGeneratingTheme}
          onGenerateTheme={currentModalProps.onGenerateTheme}
        />
      );
    case "currentTheme":
      return (
        <CurrentThemeModal
          isOpen={isModalOpen}
          onClose={closeModal}
          currentTheme={currentModalProps.currentTheme}
          defaultTheme={currentModalProps.defaultTheme}
          updateCssColor={currentModalProps.updateCssColor}
          updateCssValue={currentModalProps.updateCssValue}
          tradingViewColorConfig={currentModalProps.tradingViewColorConfig}
          setTradingViewColorConfig={
            currentModalProps.setTradingViewColorConfig
          }
        />
      );
    case "aiFineTune":
      return (
        <AIFineTuneModal
          isOpen={isModalOpen}
          onClose={closeModal}
          element={currentModalProps.element}
          currentTheme={currentModalProps.currentTheme}
          onApplyOverrides={currentModalProps.onApplyOverrides}
          previewProps={currentModalProps.previewProps}
          viewMode={currentModalProps.viewMode}
        />
      );
    case "aiFineTunePreview":
      return (
        <AIFineTunePreviewModal
          isOpen={isModalOpen}
          onClose={closeModal}
          oldTheme={currentModalProps.oldTheme}
          newOverrides={currentModalProps.newOverrides}
          previewProps={currentModalProps.previewProps}
          viewMode={currentModalProps.viewMode}
          onApply={currentModalProps.onApply}
          onReject={currentModalProps.onReject}
        />
      );
    case "themePresetPreview":
      return (
        <ThemePresetPreviewModal
          isOpen={isModalOpen}
          onClose={closeModal}
          previewProps={currentModalProps.previewProps}
          viewMode={currentModalProps.viewMode}
          currentTheme={currentModalProps.currentTheme}
          onApply={currentModalProps.onApply}
          onPreviewChange={currentModalProps.onPreviewChange}
        />
      );
    default:
      return null;
  }
}
