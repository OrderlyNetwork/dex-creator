import { useState, useEffect } from "react";
import { Button } from "./Button";
import { Card } from "./Card";
import { useDex } from "../context/DexContext";
import { useAuth } from "../context/useAuth";
import { toast } from "react-toastify";
import { get } from "../utils/apiClient";
import EditableList from "./EditableList";
import EditableFaqList, { FaqItem } from "./EditableFaqList";

export type SectionType =
  | "hero"
  | "cta"
  | "features"
  | "feeStructure"
  | "faq"
  | "team"
  | "contact"
  | "socials"
  | "about";

interface SectionConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionType: SectionType | string;
  formData: {
    keyFeatures?: string[];
    faqItems?: FaqItem[];
    teamMembers?: string[];
    contactMethods?: string[];
    problemStatement?: string;
    uniqueValue?: string;
    targetAudience?: string;
    ctaButtonText?: string;
    ctaButtonColor?: string;
    useCustomCtaColor?: boolean;
    ctaPlacement?: "hero" | "footer" | "both";
    primaryColor?: string;
    makerFee?: number;
    takerFee?: number;
    rwaMakerFee?: number;
    rwaTakerFee?: number;
    telegramLink?: string;
    discordLink?: string;
    xLink?: string;
  };
  onUpdate: (sectionType: string, data: Record<string, unknown>) => void;
}

export default function SectionConfigModal({
  isOpen,
  onClose,
  sectionType,
  formData = {},
  onUpdate,
}: SectionConfigModalProps) {
  const { dexData } = useDex();
  const { token } = useAuth();
  const [localData, setLocalData] = useState(formData || {});
  const [isLoadingFees, setIsLoadingFees] = useState(false);

  useEffect(() => {
    setLocalData(formData || {});

    if (
      sectionType === "feeStructure" &&
      isOpen &&
      !formData.makerFee &&
      token
    ) {
      fetchDexFees(false);
    }
  }, [formData, isOpen, sectionType]);

  const fetchDexFees = async (showToast = false) => {
    if (!token) return;

    setIsLoadingFees(true);
    try {
      const result = await get<{
        success: boolean;
        makerFee?: number;
        takerFee?: number;
        rwaMakerFee?: number;
        rwaTakerFee?: number;
        message?: string;
      }>("/api/graduation/fees", token, {
        showToastOnError: false,
      });

      if (result.success) {
        setLocalData(prev => ({
          ...prev,
          makerFee: result.makerFee,
          takerFee: result.takerFee,
          rwaMakerFee: result.rwaMakerFee,
          rwaTakerFee: result.rwaTakerFee,
        }));
        if (showToast) {
          toast.success("Loaded fees from DEX configuration");
        }
      }
    } catch (error) {
      console.error("Error fetching DEX fees:", error);
      if (showToast) {
        toast.error("Failed to load fees from DEX");
      }
    } finally {
      setIsLoadingFees(false);
    }
  };

  if (!isOpen) return null;

  if (!onUpdate) {
    console.error("SectionConfigModal: onUpdate prop is missing");
    return null;
  }

  const handleSave = () => {
    onUpdate(sectionType, localData);
    onClose();
  };

  const renderSectionConfig = () => {
    switch (sectionType) {
      case "cta":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                CTA Button Text
              </label>
              <p className="text-xs text-gray-400 mb-2">
                The text displayed on your primary call-to-action button (e.g.,
                "Start Trading", "Trade Now", "Launch DEX").
              </p>
              <input
                type="text"
                value={localData.ctaButtonText || "Start Trading"}
                onChange={e =>
                  setLocalData(prev => ({
                    ...prev,
                    ctaButtonText: e.target.value,
                  }))
                }
                placeholder="Start Trading"
                maxLength={50}
                className="w-full p-3 bg-background-dark border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">
                  CTA Button Color
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localData.useCustomCtaColor || false}
                    onChange={e =>
                      setLocalData(prev => ({
                        ...prev,
                        useCustomCtaColor: e.target.checked,
                      }))
                    }
                    className="sr-only"
                  />
                  <div
                    className={`w-10 h-5 rounded-full mr-2 flex items-center px-0.5 transition-colors duration-200 ease-in-out ${
                      localData.useCustomCtaColor
                        ? "bg-primary/60"
                        : "bg-background-dark/80"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${
                        localData.useCustomCtaColor
                          ? "transform translate-x-5"
                          : "transform translate-x-0"
                      }`}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-300">
                    Use Custom Color
                  </span>
                </label>
              </div>
              <p className="text-xs text-gray-400 mb-2">
                Optional: Custom color for the CTA button. If disabled, uses
                primary color.
              </p>
              <input
                type="color"
                value={
                  localData.ctaButtonColor ||
                  localData.primaryColor ||
                  "#000000"
                }
                onChange={e =>
                  setLocalData(prev => ({
                    ...prev,
                    ctaButtonColor: e.target.value,
                  }))
                }
                disabled={!localData.useCustomCtaColor}
                className="w-full h-10 bg-background-dark border border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                CTA Placement
              </label>
              <p className="text-xs text-gray-400 mb-2">
                Where should the CTA button appear?
              </p>
              <select
                value={localData.ctaPlacement || "both"}
                onChange={e =>
                  setLocalData(prev => ({
                    ...prev,
                    ctaPlacement: e.target.value as "hero" | "footer" | "both",
                  }))
                }
                className="w-full p-3 bg-background-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
              >
                <option value="hero">Hero Section Only</option>
                <option value="footer">Footer Only</option>
                <option value="both">Both Hero and Footer</option>
              </select>
            </div>
          </div>
        );

      case "features":
        return (
          <EditableList
            items={localData.keyFeatures || []}
            onItemsChange={items =>
              setLocalData(prev => ({ ...prev, keyFeatures: items }))
            }
            label="Key Features"
            description="Add, edit, or remove features that will be highlighted in the features section."
            placeholder="Enter a new feature..."
            emptyMessage="No features added yet. Add your first feature above."
          />
        );

      case "faq":
        return (
          <EditableFaqList
            items={localData.faqItems || []}
            onItemsChange={items =>
              setLocalData(prev => ({ ...prev, faqItems: items }))
            }
            label="FAQ Items"
            description="Add frequently asked questions with their answers."
            placeholderQuestion="Enter a question..."
            placeholderAnswer="Enter an answer..."
            emptyMessage="No FAQ items added yet. Add your first question and answer above."
          />
        );

      case "team":
        return (
          <EditableList
            items={localData.teamMembers || []}
            onItemsChange={items =>
              setLocalData(prev => ({ ...prev, teamMembers: items }))
            }
            label="Team Members"
            description="Add team member names or roles. The AI will generate appropriate team member information."
            placeholder="Enter team member name or role..."
            emptyMessage="No team members added yet. Add your first team member above."
          />
        );

      case "contact":
        return (
          <EditableList
            items={localData.contactMethods || []}
            onItemsChange={items =>
              setLocalData(prev => ({ ...prev, contactMethods: items }))
            }
            label="Contact Methods"
            description="Add contact methods or information (e.g., email addresses, phone numbers, office locations)."
            placeholder="Enter contact method..."
            emptyMessage="No contact methods added yet. Add your first contact method above."
          />
        );

      case "about":
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-1">Content Guidance</h3>
              <p className="text-xs text-gray-400 mb-4">
                Help the AI generate better content by answering these
                questions. All fields are optional but highly recommended.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  What problem does your product solve?
                </label>
                <textarea
                  value={localData.problemStatement || ""}
                  onChange={e =>
                    setLocalData(prev => ({
                      ...prev,
                      problemStatement: e.target.value,
                    }))
                  }
                  placeholder="e.g., Traders struggle with high fees and slow transaction times on existing DEX platforms..."
                  maxLength={500}
                  className="w-full p-3 bg-background-dark border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  What makes you unique?
                </label>
                <textarea
                  value={localData.uniqueValue || ""}
                  onChange={e =>
                    setLocalData(prev => ({
                      ...prev,
                      uniqueValue: e.target.value,
                    }))
                  }
                  placeholder="e.g., Zero trading fees, instant settlement, and advanced order types..."
                  maxLength={500}
                  className="w-full p-3 bg-background-dark border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Who is your target audience?
                </label>
                <textarea
                  value={localData.targetAudience || ""}
                  onChange={e =>
                    setLocalData(prev => ({
                      ...prev,
                      targetAudience: e.target.value,
                    }))
                  }
                  placeholder="e.g., Professional traders, DeFi enthusiasts, and crypto investors looking for..."
                  maxLength={500}
                  className="w-full p-3 bg-background-dark border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                  rows={3}
                />
              </div>
            </div>
          </div>
        );

      case "feeStructure":
        return (
          <div className="space-y-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-sm font-medium mb-1">Trading Fees</h3>
                <p className="text-xs text-gray-400">
                  Configure the fee structure for your perpetual DEX. Fees are
                  displayed as percentages (e.g., 0.1 = 0.1%).
                </p>
              </div>
              {token && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => fetchDexFees(true)}
                  disabled={isLoadingFees}
                  className="ml-4 flex-shrink-0"
                >
                  {isLoadingFees ? (
                    <>
                      <div className="i-mdi:loading h-4 w-4 mr-2 animate-spin"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      <div className="i-mdi:refresh h-4 w-4 mr-2"></div>
                      Load from DEX
                    </>
                  )}
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 items-start">
              <div className="flex flex-col space-y-2">
                <label className="block text-sm font-medium">
                  Maker Fee (%)
                </label>
                <p className="text-xs text-gray-400 min-h-[2.5rem]">
                  Fee for orders that add liquidity (maker orders).
                </p>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  max="100"
                  value={localData.makerFee ?? ""}
                  onChange={e =>
                    setLocalData(prev => ({
                      ...prev,
                      makerFee: e.target.value
                        ? parseFloat(e.target.value)
                        : undefined,
                    }))
                  }
                  placeholder="0.1"
                  className="w-full p-3 bg-background-dark border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label className="block text-sm font-medium">
                  Taker Fee (%)
                </label>
                <p className="text-xs text-gray-400 min-h-[2.5rem]">
                  Fee for orders that remove liquidity (taker orders).
                </p>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  max="100"
                  value={localData.takerFee ?? ""}
                  onChange={e =>
                    setLocalData(prev => ({
                      ...prev,
                      takerFee: e.target.value
                        ? parseFloat(e.target.value)
                        : undefined,
                    }))
                  }
                  placeholder="0.1"
                  className="w-full p-3 bg-background-dark border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label className="block text-sm font-medium">
                  RWA Maker Fee (%)
                </label>
                <p className="text-xs text-gray-400 min-h-[2.5rem]">
                  Maker fee for Real World Assets (RWA) trading.
                </p>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  max="100"
                  value={localData.rwaMakerFee ?? ""}
                  onChange={e =>
                    setLocalData(prev => ({
                      ...prev,
                      rwaMakerFee: e.target.value
                        ? parseFloat(e.target.value)
                        : undefined,
                    }))
                  }
                  placeholder="0.1"
                  className="w-full p-3 bg-background-dark border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col space-y-2">
                <label className="block text-sm font-medium">
                  RWA Taker Fee (%)
                </label>
                <p className="text-xs text-gray-400 min-h-[2.5rem]">
                  Taker fee for Real World Assets (RWA) trading.
                </p>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  max="100"
                  value={localData.rwaTakerFee ?? ""}
                  onChange={e =>
                    setLocalData(prev => ({
                      ...prev,
                      rwaTakerFee: e.target.value
                        ? parseFloat(e.target.value)
                        : undefined,
                    }))
                  }
                  placeholder="0.1"
                  className="w-full p-3 bg-background-dark border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>
        );

      case "socials":
        return (
          <div className="space-y-4">
            {dexData &&
              (dexData.telegramLink ||
                dexData.discordLink ||
                dexData.xLink) && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setLocalData({
                      telegramLink: dexData.telegramLink || "",
                      discordLink: dexData.discordLink || "",
                      xLink: dexData.xLink || "",
                    });
                    toast.success("Loaded social links from DEX");
                  }}
                  className="mb-4"
                >
                  <div className="i-mdi:refresh h-4 w-4 mr-2"></div>
                  Load from DEX
                </Button>
              )}
            <div>
              <label className="block text-sm font-medium mb-2">
                Telegram Link
              </label>
              <p className="text-xs text-gray-400 mb-2">
                Your Telegram community or channel URL.
              </p>
              <input
                type="url"
                value={localData.telegramLink || ""}
                onChange={e =>
                  setLocalData(prev => ({
                    ...prev,
                    telegramLink: e.target.value,
                  }))
                }
                placeholder="https://t.me/yourchannel"
                className="w-full p-3 bg-background-dark border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Discord Link
              </label>
              <p className="text-xs text-gray-400 mb-2">
                Your Discord server invite URL.
              </p>
              <input
                type="url"
                value={localData.discordLink || ""}
                onChange={e =>
                  setLocalData(prev => ({
                    ...prev,
                    discordLink: e.target.value,
                  }))
                }
                placeholder="https://discord.gg/yourserver"
                className="w-full p-3 bg-background-dark border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                X (Twitter) Link
              </label>
              <p className="text-xs text-gray-400 mb-2">
                Your X (Twitter) profile URL.
              </p>
              <input
                type="url"
                value={localData.xLink || ""}
                onChange={e =>
                  setLocalData(prev => ({
                    ...prev,
                    xLink: e.target.value,
                  }))
                }
                placeholder="https://x.com/yourhandle"
                className="w-full p-3 bg-background-dark border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-gray-400 text-sm">
            No additional configuration available for this section.
          </div>
        );
    }
  };

  const getSectionLabel = () => {
    const labels: Record<string, string> = {
      hero: "Hero",
      cta: "CTA",
      features: "Features",
      feeStructure: "Fee Structure",
      faq: "FAQ",
      team: "Team",
      contact: "Contact",
      socials: "Socials",
      about: "About",
    };
    return labels[sectionType] || sectionType;
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center h-screen">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm z-[1001]"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative z-[1002] max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto bg-background-light border border-primary/20 rounded-xl shadow-2xl slide-fade-in">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-primary-light">
              Configure {getSectionLabel()} Section
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <div className="i-mdi:close h-6 w-6"></div>
            </button>
          </div>

          <Card className="mb-6">{renderSectionConfig()}</Card>

          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Save Configuration
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
