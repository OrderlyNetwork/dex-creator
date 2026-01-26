import { useState, useEffect, FormEvent, useRef, useMemo } from "react";
import type { MetaFunction } from "@remix-run/node";
import { toast } from "react-toastify";
import { useAuth } from "../context/useAuth";
import { useDex } from "../context/DexContext";
import { putFormData, get } from "../utils/apiClient";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import Form from "../components/Form";
import ImagePaste from "../components/ImagePaste";
import BoardVisibilitySection from "../components/BoardVisibilitySection";
import { useNavigate } from "@remix-run/react";
import { maxLength, composeValidators } from "../utils/validation";
import FuzzySearchInput from "../components/FuzzySearchInput";
import DexCard from "../components/DexCard";
import { BackDexDashboard } from "../components/BackDexDashboard";

export const meta: MetaFunction = () => [
  { title: "DEX Card - Orderly One" },
  {
    name: "description",
    content:
      "Customize your DEX card appearance on the leaderboard. Upload banners, logos, and add description.",
  },
];

interface NetworkInfo {
  id: string;
  name: string;
}

type NetworksResponse = NetworkInfo[];

export default function DexCardRoute() {
  const { isAuthenticated, token, isLoading } = useAuth();
  const { dexData, isLoading: isDexLoading, refreshDexData } = useDex();
  const navigate = useNavigate();

  const [description, setDescription] = useState("");
  const [banner, setBanner] = useState<Blob | null>(null);
  const [logo, setLogo] = useState<Blob | null>(null);
  const [tokenAddress, setTokenAddress] = useState("");
  const [tokenChain, setTokenChain] = useState("");
  const [telegramLink, setTelegramLink] = useState("");
  const [discordLink, setDiscordLink] = useState("");
  const [xLink, setXLink] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [networks, setNetworks] = useState<NetworkInfo[]>([]);
  const [isLoadingNetworks, setIsLoadingNetworks] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [networkSearchQuery, setNetworkSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredNetworks = useMemo(() => {
    if (!networkSearchQuery.trim()) {
      return networks;
    }
    const query = networkSearchQuery.toLowerCase();
    return networks.filter(
      network =>
        network.name.toLowerCase().includes(query) ||
        network.id.toLowerCase().includes(query)
    );
  }, [networks, networkSearchQuery]);
  const [isValidatingToken, setIsValidatingToken] = useState(false);
  const [tokenValidation, setTokenValidation] = useState<{
    isValid: boolean;
    tokenInfo?: {
      attributes: {
        name: string;
        symbol: string;
        image_url?: string;
        price_usd?: string;
        market_cap_usd?: string;
      };
      relationships?: {
        top_pools?: {
          data: Array<{ id: string; type: string }>;
        };
      };
    };
    error?: string;
  } | null>(null);

  const base64ToBlob = async (base64: string): Promise<Blob> => {
    const response = await fetch(base64);
    return response.blob();
  };

  const validateToken = async (address: string, chain: string) => {
    if (!address.trim() || !chain.trim()) {
      setTokenValidation(null);
      return;
    }

    setIsValidatingToken(true);
    try {
      const response = await fetch(
        `https://api.geckoterminal.com/api/v2/networks/${chain}/tokens/${address}`
      );

      if (response.ok) {
        const data = await response.json();
        setTokenValidation({
          isValid: true,
          tokenInfo: data.data,
        });
      } else {
        setTokenValidation({
          isValid: false,
          error: "Token not found on this network",
        });
      }
    } catch {
      setTokenValidation({
        isValid: false,
        error: "Failed to validate token",
      });
    } finally {
      setIsValidatingToken(false);
    }
  };

  const handleTokenAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAddress = e.target.value;
    setTokenAddress(newAddress);
    if (tokenValidation) {
      setTokenValidation(null);
    }
  };

  const handleTokenAddressBlur = () => {
    if (tokenAddress.trim() && tokenChain.trim()) {
      validateToken(tokenAddress, tokenChain);
    }
  };

  const handleNetworkSearch = (query: string) => {
    setNetworkSearchQuery(query);
    setIsDropdownOpen(true);
  };

  const selectNetwork = (network: NetworkInfo) => {
    setTokenChain(network.id);
    setNetworkSearchQuery(network.name);
    setIsDropdownOpen(false);
    if (tokenAddress.trim()) {
      validateToken(tokenAddress, network.id);
    }
  };

  useEffect(() => {
    if (dexData) {
      setDescription(dexData.description || "");
      setTokenAddress(dexData.tokenAddress || "");
      setTokenChain(dexData.tokenChain || "");
      setTelegramLink(dexData.telegramLink || "");
      setDiscordLink(dexData.discordLink || "");
      setXLink(dexData.xLink || "");
      setWebsiteUrl(dexData.websiteUrl || "");

      const loadImages = async () => {
        if (dexData.banner) {
          setBanner(await base64ToBlob(dexData.banner));
        }
        if (dexData.logo) {
          setLogo(await base64ToBlob(dexData.logo));
        }
      };
      loadImages();
    }
  }, [dexData]);

  useEffect(() => {
    if (dexData?.tokenAddress && dexData?.tokenChain) {
      validateToken(dexData.tokenAddress, dexData.tokenChain);
    }
  }, [dexData?.tokenAddress, dexData?.tokenChain]);

  useEffect(() => {
    if (tokenChain && networks.length > 0) {
      const selectedNetwork = networks.find(
        network => network.id === tokenChain
      );
      if (selectedNetwork) {
        setNetworkSearchQuery(selectedNetwork.name);
      }
    }
  }, [tokenChain, networks]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const loadNetworks = async () => {
      if (!token) return;

      setIsLoadingNetworks(true);
      try {
        const response = await get<NetworksResponse>("api/dex/networks", token);
        if (response && Array.isArray(response)) {
          const sortedNetworks = response.sort((a, b) =>
            a.name.localeCompare(b.name)
          );
          setNetworks(sortedNetworks);
        }
      } catch (error) {
        console.error("Error loading networks:", error);
        toast.error("Failed to load available networks");
      } finally {
        setIsLoadingNetworks(false);
      }
    };

    loadNetworks();
  }, [token]);

  const descriptionValidator = composeValidators(maxLength(150, "Description"));

  const tokenAddressValidator = composeValidators(
    maxLength(100, "Token address")
  );

  const handleImageChange = (field: string) => (blob: Blob | null) => {
    switch (field) {
      case "banner":
        setBanner(blob);
        break;
      case "logo":
        setLogo(blob);
        break;
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!dexData || !dexData.id) {
      toast.error("DEX information is not available");
      return;
    }

    if (
      tokenAddress.trim() &&
      tokenChain.trim() &&
      tokenValidation &&
      !tokenValidation.isValid
    ) {
      toast.error("Please fix token validation errors before saving");
      return;
    }

    setIsSaving(true);

    try {
      const formData = new FormData();

      if (description.trim()) {
        formData.append("description", description.trim());
      }
      if (tokenAddress.trim()) {
        formData.append("tokenAddress", tokenAddress.trim());
      }
      if (tokenChain.trim()) {
        formData.append("tokenChain", tokenChain.trim());
      }
      if (telegramLink.trim()) {
        formData.append("telegramLink", telegramLink.trim());
      }
      if (discordLink.trim()) {
        formData.append("discordLink", discordLink.trim());
      }
      if (xLink.trim()) {
        formData.append("xLink", xLink.trim());
      }
      if (websiteUrl.trim()) {
        formData.append("websiteUrl", websiteUrl.trim());
      }

      if (banner) {
        formData.append("banner", banner);
      }
      if (logo) {
        formData.append("logo", logo);
      }

      await putFormData(`api/dex/social-card`, formData, token);

      toast.success("DEX card information updated successfully!");
      await refreshDexData();
      navigate("/dex");
    } catch (error) {
      console.error("Error updating DEX card:", error);
      toast.error("Failed to update DEX card information");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || isDexLoading) {
    return (
      <div className="w-full h-[calc(100vh-64px)] flex items-center justify-center px-4 mt-26 pb-52">
        <div className="text-center">
          <div className="i-svg-spinners:pulse-rings-multiple h-12 w-12 mx-auto text-primary-light mb-4"></div>
          <div className="text-base md:text-lg mb-2">Loading your DEX</div>
          <div className="text-xs md:text-sm text-gray-400">
            Please wait while we fetch your configuration
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-6 md:py-10 mt-26 pb-52">
        <div className="text-center">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4 md:mb-6">
            DEX Card Setup
          </h1>
          <Card>
            <h2 className="text-lg md:text-xl font-medium mb-3 md:mb-4">
              Authentication Required
            </h2>
            <p className="mb-4 md:mb-6 text-sm md:text-base text-gray-300">
              Please connect your wallet and login to set up your DEX card.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  if (!dexData) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-6 md:py-10 mt-26 pb-52">
        <div className="text-center">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4 md:mb-6">
            DEX Card Setup
          </h1>
          <Card>
            <h2 className="text-lg md:text-xl font-medium mb-3 md:mb-4">
              DEX Required
            </h2>
            <p className="mb-4 md:mb-6 text-sm md:text-base text-gray-300">
              You need to create a DEX first before setting up your DEX card.
            </p>
            <Button onClick={() => navigate("/dex")}>Create DEX</Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl mt-26 pb-52">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <BackDexDashboard />
          <h1 className="text-2xl md:text-3xl font-bold gradient-text">
            DEX Card Setup
          </h1>
          <p className="text-gray-400 mt-2">
            Configure how your DEX appears on the board page
          </p>
        </div>
      </div>

      <Card>
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Board Visibility</h2>
          <BoardVisibilitySection
            dexData={dexData}
            token={token || ""}
            onUpdate={refreshDexData}
          />
        </div>

        {(dexData.showOnBoard ?? true) ? (
          <>
            <div className="mb-6 pt-6 border-t border-gray-600">
              <h2 className="text-lg font-semibold mb-2">Board Page Display</h2>
              <p className="text-gray-400 text-sm mb-4">
                This information will be displayed on the board page to showcase
                your DEX alongside others.
              </p>

              <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-warning/20 p-1.5 rounded-full flex-shrink-0">
                    <div className="i-mdi:information text-warning w-4 h-4"></div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-warning mb-1">
                      Graduation Required
                    </h3>
                    <p className="text-xs text-gray-300">
                      Your DEX card will only appear on the board page after you
                      have graduated your DEX. Complete the graduation process
                      to start earning fees and make your DEX visible on the
                      board.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Form
              onSubmit={handleSubmit}
              className="space-y-6"
              submitText="Save DEX Card"
              isLoading={isSaving}
              loadingText="Saving..."
              disabled={isSaving}
            >
              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Description <span className="text-gray-400">(optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Brief description of your DEX for the board page"
                  className="w-full px-3 py-2 bg-background-dark border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  rows={3}
                  maxLength={150}
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-400">
                    {descriptionValidator(description) ||
                      "Brief description for social media"}
                  </p>
                  <span className="text-xs text-gray-500">
                    {description.length}/150
                  </span>
                </div>
              </div>

              {/* Banner Image */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">
                    Banner Image{" "}
                    <span className="text-gray-400">(optional)</span>
                  </label>
                  {dexData?.primaryLogo && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        if (dexData?.primaryLogo) {
                          base64ToBlob(dexData.primaryLogo).then(blob => {
                            handleImageChange("banner")(blob);
                          });
                        }
                      }}
                    >
                      Use Primary Logo
                    </Button>
                  )}
                </div>
                <p className="text-xs text-gray-400 mb-3">
                  Large image displayed on the board page. Recommended:
                  1200x630px
                </p>
                <ImagePaste
                  id="banner"
                  label=""
                  value={banner || undefined}
                  onChange={handleImageChange("banner")}
                  imageType="banner"
                  helpText="Large banner image for the board page display"
                />
              </div>

              {/* Logo Image */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">
                    Logo <span className="text-gray-400">(optional)</span>
                  </label>
                  {dexData?.secondaryLogo && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        if (dexData?.secondaryLogo) {
                          base64ToBlob(dexData.secondaryLogo).then(blob => {
                            handleImageChange("logo")(blob);
                          });
                        }
                      }}
                    >
                      Use Secondary Logo
                    </Button>
                  )}
                </div>
                <p className="text-xs text-gray-400 mb-3">
                  Small logo for the board page. Recommended: 400x400px
                </p>
                <ImagePaste
                  id="logo"
                  label=""
                  value={logo || undefined}
                  onChange={handleImageChange("logo")}
                  imageType="logo"
                  helpText="Small logo for the board page display"
                />
              </div>

              {/* Token Information */}
              <div className="border-t border-gray-600 pt-6">
                <h3 className="text-md font-semibold mb-4">
                  Token Information
                </h3>
                <p className="text-xs text-gray-400 mb-4">
                  Optional: Add your token details for enhanced board page
                  display
                </p>

                {/* Token Address */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Token Address{" "}
                    <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={tokenAddress}
                    onChange={handleTokenAddressChange}
                    onBlur={handleTokenAddressBlur}
                    placeholder="Enter your token contract address"
                    className="w-full px-3 py-2 bg-background-dark border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    maxLength={100}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {tokenAddressValidator(tokenAddress) ||
                      "Your token's contract address"}
                  </p>

                  {/* Token Validation Status */}
                  {isValidatingToken && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-400">
                      <div className="i-mdi:loading h-4 w-4 animate-spin"></div>
                      Validating token...
                    </div>
                  )}

                  {tokenValidation && !isValidatingToken && (
                    <div className="mt-2">
                      {tokenValidation.isValid ? (
                        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                          <div className="flex items-center gap-3">
                            {tokenValidation.tokenInfo?.attributes
                              ?.image_url && (
                              <img
                                src={
                                  tokenValidation.tokenInfo.attributes.image_url
                                }
                                alt={tokenValidation.tokenInfo.attributes.name}
                                className="w-8 h-8 rounded-full"
                              />
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-green-400">
                                  {tokenValidation.tokenInfo?.attributes?.name}
                                </span>
                                <span className="text-gray-400">
                                  (
                                  {
                                    tokenValidation.tokenInfo?.attributes
                                      ?.symbol
                                  }
                                  )
                                </span>
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                Price: $
                                {new Intl.NumberFormat("en-US", {
                                  maximumSignificantDigits: 4,
                                }).format(
                                  Number(
                                    tokenValidation.tokenInfo?.attributes
                                      ?.price_usd || "0"
                                  )
                                )}
                                {tokenValidation.tokenInfo?.attributes
                                  ?.market_cap_usd && (
                                  <span className="ml-2">
                                    • Market Cap: $
                                    {new Intl.NumberFormat("en-US", {
                                      notation: "compact",
                                      maximumSignificantDigits: 4,
                                    }).format(
                                      Number(
                                        tokenValidation.tokenInfo?.attributes
                                          ?.market_cap_usd || "0"
                                      )
                                    )}
                                  </span>
                                )}
                              </div>
                              {tokenValidation.tokenInfo?.relationships
                                ?.top_pools?.data?.[0] &&
                                (() => {
                                  const poolId =
                                    tokenValidation.tokenInfo?.relationships
                                      ?.top_pools?.data?.[0]?.id;
                                  if (!poolId) return null;
                                  const [network, actualPoolId] =
                                    poolId.split("_");
                                  return (
                                    <a
                                      href={`https://www.geckoterminal.com/${network}/pools/${actualPoolId}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-primary hover:text-primary-light inline-flex items-center gap-1 mt-1"
                                    >
                                      View on GeckoTerminal
                                      <div className="i-mdi:open-in-new h-3 w-3"></div>
                                    </a>
                                  );
                                })()}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-red-400">
                            <div className="i-mdi:alert-circle h-4 w-4"></div>
                            <span className="text-sm">
                              {tokenValidation.error}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Token Chain */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Token Chain{" "}
                    <span className="text-gray-400">(optional)</span>
                  </label>
                  <div className="relative" ref={dropdownRef}>
                    <FuzzySearchInput
                      placeholder="Search blockchain networks..."
                      value={networkSearchQuery}
                      onSearch={handleNetworkSearch}
                      className="mb-0"
                      disabled={isLoadingNetworks}
                      debounceTime={100}
                    />
                    {isLoadingNetworks && (
                      <p className="text-xs text-gray-400 mt-1">
                        Loading networks...
                      </p>
                    )}
                    {!isLoadingNetworks &&
                      isDropdownOpen &&
                      filteredNetworks.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-background-dark border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {filteredNetworks.map(network => (
                            <button
                              key={network.id}
                              type="button"
                              onClick={() => selectNetwork(network)}
                              className="w-full px-3 py-2 text-left hover:bg-gray-700 focus:bg-gray-700 focus:outline-none flex items-center justify-between"
                            >
                              <span>{network.name}</span>
                              <span className="text-xs text-gray-400">
                                {network.id}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    {!isLoadingNetworks &&
                      isDropdownOpen &&
                      networkSearchQuery &&
                      filteredNetworks.length === 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-background-dark border border-gray-600 rounded-lg shadow-lg p-3">
                          <p className="text-sm text-gray-400">
                            No networks found
                          </p>
                        </div>
                      )}
                  </div>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="border-t border-gray-600 pt-6">
                <h3 className="text-md font-semibold mb-4">
                  Social Media Links
                </h3>
                <p className="text-xs text-gray-400 mb-4">
                  Optional: Add your social media links for enhanced board page
                  display
                </p>

                <div className="space-y-4">
                  {/* Telegram */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Telegram <span className="text-gray-400">(optional)</span>
                    </label>
                    <input
                      type="url"
                      value={telegramLink}
                      onChange={e => setTelegramLink(e.target.value)}
                      placeholder="https://t.me/your-group"
                      className="w-full px-3 py-2 bg-background-dark border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  {/* Discord */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Discord <span className="text-gray-400">(optional)</span>
                    </label>
                    <input
                      type="url"
                      value={discordLink}
                      onChange={e => setDiscordLink(e.target.value)}
                      placeholder="https://discord.gg/your-server"
                      className="w-full px-3 py-2 bg-background-dark border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  {/* X (Twitter) */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      X (Twitter){" "}
                      <span className="text-gray-400">(optional)</span>
                    </label>
                    <input
                      type="url"
                      value={xLink}
                      onChange={e => setXLink(e.target.value)}
                      placeholder="https://twitter.com/your-account"
                      className="w-full px-3 py-2 bg-background-dark border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Website URL */}
              <div className="border-t border-gray-600 pt-6">
                <h3 className="text-md font-semibold mb-4">Website URL</h3>
                <p className="text-xs text-gray-400 mb-4">
                  Optional: Add your DEX website URL for the board page
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Website URL{" "}
                      <span className="text-gray-400">(optional)</span>
                    </label>
                    <input
                      type="url"
                      value={websiteUrl}
                      onChange={e => setWebsiteUrl(e.target.value)}
                      placeholder="https://your-dex.com"
                      className="w-full px-3 py-2 bg-background-dark border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      This will be used as the main website link on your DEX
                      card
                    </p>
                  </div>
                </div>
              </div>
            </Form>

            {/* Preview Section */}
            <div className="mt-8 pt-6 border-t border-gray-600">
              <h3 className="text-lg font-semibold mb-4">Board Page Preview</h3>
              <div className="max-w-lg">
                <DexCard
                  broker={{
                    id: dexData.id,
                    brokerId: dexData.brokerId,
                    brokerName: dexData.brokerName,
                    dexUrl:
                      websiteUrl ||
                      (dexData.customDomain
                        ? `https://${dexData.customDomain}`
                        : dexData.repoUrl
                          ? `https://dex.orderly.network/${dexData.repoUrl.split("/").pop()}/`
                          : null),
                    totalVolume: 1250000,
                    totalPnl: 85000,
                    description,
                    banner: banner ? URL.createObjectURL(banner) : undefined,
                    logo: logo ? URL.createObjectURL(logo) : undefined,
                    tokenAddress,
                    tokenChain,
                    tokenSymbol: tokenValidation?.isValid
                      ? tokenValidation.tokenInfo?.attributes.symbol
                      : undefined,
                    tokenName: tokenValidation?.isValid
                      ? tokenValidation.tokenInfo?.attributes.name
                      : undefined,
                    tokenPrice: tokenValidation?.isValid
                      ? Number(
                          tokenValidation.tokenInfo?.attributes.price_usd || "0"
                        )
                      : undefined,
                    tokenMarketCap: tokenValidation?.isValid
                      ? Number(
                          tokenValidation.tokenInfo?.attributes
                            .market_cap_usd || "0"
                        )
                      : undefined,
                    tokenImageUrl: tokenValidation?.isValid
                      ? tokenValidation.tokenInfo?.attributes.image_url
                      : undefined,
                    telegramLink,
                    discordLink,
                    xLink,
                    websiteUrl,
                  }}
                  timePeriod="weekly"
                />
              </div>
              <p className="text-xs text-gray-400 mt-3">
                This is how your DEX will appear on the board page.
              </p>
            </div>
          </>
        ) : (
          <div className="pt-6 border-t border-gray-600">
            <div className="bg-background-light/30 border border-light/20 rounded-lg p-6 text-center">
              <div className="i-heroicons:eye-slash w-12 h-12 mx-auto mb-3 text-gray-500"></div>
              <h3 className="text-lg font-semibold mb-2">
                DEX Hidden from Board
              </h3>
              <p className="text-sm text-gray-400">
                Your DEX is currently hidden from the public board. Enable board
                visibility above to configure how your DEX appears to others.
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
