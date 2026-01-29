import { useState } from "react";
import { toast } from "react-toastify";
import { Button } from "./Button";
import { post } from "../utils/apiClient";

interface LandingPageData {
  id: string;
  customDomain?: string | null;
  repoUrl?: string | null;
}

interface LandingPageCustomDomainSectionProps {
  landingPageData: LandingPageData;
  token: string | null;
  isSaving: boolean;
  onLandingPageUpdate: () => void;
  onSavingChange: (saving: boolean) => void;
  onShowDomainRemoveConfirm: () => void;
}

export default function LandingPageCustomDomainSection({
  landingPageData,
  token,
  isSaving,
  onLandingPageUpdate,
  onSavingChange,
  onShowDomainRemoveConfirm,
}: LandingPageCustomDomainSectionProps) {
  const [customDomain, setCustomDomain] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const handleSetDomain = async () => {
    const normalizedDomain = customDomain.trim().toLowerCase();

    const domainRegex =
      /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*\.[a-z]{2,}$/;

    if (!normalizedDomain) {
      toast.error("Domain name cannot be empty");
      return;
    }

    if (normalizedDomain !== customDomain) {
      toast.error("Domain must be lowercase with no leading/trailing spaces");
      return;
    }

    if (!domainRegex.test(normalizedDomain)) {
      toast.error("Please enter a valid domain name (e.g., example.com)");
      return;
    }

    if (
      normalizedDomain.includes("..") ||
      normalizedDomain.startsWith(".") ||
      normalizedDomain.endsWith(".")
    ) {
      toast.error(
        "Domain cannot have consecutive dots or start/end with a dot"
      );
      return;
    }

    const ipRegex = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
    if (ipRegex.test(normalizedDomain)) {
      toast.error("IP addresses are not allowed. Please use a domain name");
      return;
    }

    handleSetDomainAfterAcknowledgment(normalizedDomain);
  };

  const handleSetDomainAfterAcknowledgment = async (domainToSet: string) => {
    onSavingChange(true);

    try {
      await post(
        `api/landing-page/${landingPageData.id}/custom-domain`,
        { domain: domainToSet },
        token
      );

      toast.success(
        isEditing
          ? "Custom domain updated successfully"
          : "Custom domain configured successfully"
      );
      setIsEditing(false);
      setCustomDomain("");
      onLandingPageUpdate();
    } catch (error) {
      console.error("Error setting custom domain:", error);
      toast.error(
        isEditing
          ? "Failed to update custom domain"
          : "Failed to set custom domain"
      );
    } finally {
      onSavingChange(false);
    }
  };

  const handleEditDomain = () => {
    setCustomDomain(landingPageData.customDomain || "");
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setCustomDomain("");
  };

  const copyToClipboard = (text: string, successMessage: string) => {
    navigator.clipboard.writeText(text);
    toast.success(successMessage);
  };

  return (
    <div>
      <h3 className="text-lg font-bold mb-4">Custom Domain Setup</h3>
      <p className="text-sm text-gray-300 mb-4">
        Deploy your landing page to your own domain instead of using the default
        GitHub Pages URL. Changes will be deployed automatically.
      </p>

      {landingPageData.customDomain ? (
        <div className="mb-4">
          {!isEditing ? (
            <>
              <div className="flex flex-col md:flex-row gap-3 items-start md:items-center mb-4">
                <div className="bg-success/10 text-success px-3 py-1 rounded-full text-sm flex items-center">
                  <div className="i-mdi:check-circle h-4 w-4 mr-1"></div>
                  Domain Configured
                </div>
                <div className="text-sm">
                  Your landing page is available at{" "}
                  <a
                    href={`https://${landingPageData.customDomain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-light hover:underline inline-flex items-center"
                  >
                    {landingPageData.customDomain}
                    <div className="i-mdi:open-in-new h-3.5 w-3.5 ml-1"></div>
                  </a>
                </div>
              </div>

              <div className="bg-info/10 rounded-lg border border-info/20 p-4 mb-4">
                <h5 className="text-sm font-bold mb-2 flex items-center">
                  <div className="i-mdi:information-outline text-info mr-2 h-4 w-4"></div>
                  DNS Configuration Status
                </h5>
                <p className="text-sm text-gray-300 mb-3">
                  It may take up to 24 hours for DNS changes to propagate. If
                  your domain is not working yet, please check back later.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={handleEditDomain}
                    variant="secondary"
                    size="sm"
                    disabled={isSaving}
                  >
                    <span className="flex items-center gap-1">
                      <div className="i-mdi:pencil h-4 w-4"></div>
                      Edit Domain
                    </span>
                  </Button>
                  <Button
                    onClick={onShowDomainRemoveConfirm}
                    variant="danger"
                    size="sm"
                    isLoading={isSaving}
                    loadingText="Removing..."
                    disabled={isSaving}
                  >
                    <span className="flex items-center gap-1">
                      <div className="i-mdi:delete h-4 w-4"></div>
                      Remove Custom Domain
                    </span>
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="mb-4">
              <div className="flex flex-col md:flex-row gap-3 items-start md:items-center mb-4">
                <div className="bg-warning/10 text-warning px-3 py-1 rounded-full text-sm flex items-center">
                  <div className="i-mdi:pencil h-4 w-4 mr-1"></div>
                  Editing Domain
                </div>
                <div className="text-sm text-gray-300">
                  Current domain: {landingPageData.customDomain}
                </div>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="editCustomDomain"
                  className="block text-sm font-bold mb-1"
                >
                  Domain Name
                </label>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
                  <input
                    id="editCustomDomain"
                    type="text"
                    value={customDomain}
                    onChange={e => setCustomDomain(e.target.value)}
                    placeholder="example.com"
                    className="flex-1 bg-background-dark/80 border border-light/10 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-primary-light focus:border-primary-light"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSetDomain}
                      variant="primary"
                      size="sm"
                      isLoading={isSaving}
                      loadingText="Saving..."
                      disabled={!customDomain || isSaving}
                    >
                      <span className="flex items-center gap-1">
                        <div className="i-mdi:check h-4 w-4"></div>
                        Update
                      </span>
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      variant="secondary"
                      size="sm"
                      disabled={isSaving}
                    >
                      <span className="flex items-center gap-1">
                        <div className="i-mdi:close h-4 w-4"></div>
                        Cancel
                      </span>
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Enter your domain without 'http://' or 'https://' (e.g.,
                  example.com)
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mb-4">
          <div className="mb-4">
            <label
              htmlFor="customDomain"
              className="block text-sm font-bold mb-1"
            >
              Domain Name
            </label>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
              <input
                id="customDomain"
                type="text"
                value={customDomain}
                onChange={e => setCustomDomain(e.target.value)}
                placeholder="example.com"
                className="flex-1 bg-background-dark/80 border border-light/10 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-primary-light focus:border-primary-light"
              />
              <Button
                onClick={handleSetDomain}
                variant="primary"
                size="sm"
                isLoading={isSaving}
                loadingText="Saving..."
                disabled={!customDomain || isSaving}
                className="w-full sm:w-auto"
              >
                <span className="flex items-center gap-1 justify-center sm:justify-start">
                  <div className="i-mdi:link h-4 w-4"></div>
                  Set Domain
                </span>
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Enter your domain without 'http://' or 'https://' (e.g.,
              example.com)
            </p>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-light/10 p-4 bg-base-8/50">
        <h5 className="text-sm font-bold mb-3 flex items-center">
          <div className="i-mdi:dns h-4 w-4 mr-2 text-primary-light"></div>
          DNS Configuration Instructions
        </h5>
        <p className="text-sm text-gray-300 mb-3">
          To use a custom domain, you'll need to configure your domain's DNS
          settings:
        </p>

        {landingPageData.customDomain &&
        landingPageData.customDomain.split(".").length === 2 ? (
          <div className="space-y-3">
            <div className="bg-base-9/70 rounded p-3 font-mono text-xs overflow-x-auto">
              <div className="mb-2 text-gray-400">
                <span className="text-primary-light">Step 1:</span> Add{" "}
                <span className="text-primary-light">A records</span> for your
                apex domain:
              </div>
              <div className="space-y-1">
                <div className="flex items-center">
                  <span className="text-gray-400">Type:</span>{" "}
                  <div className="flex items-center">
                    <span className="text-white">A</span>
                    <button
                      className="ml-1.5 text-gray-400 hover:text-primary-light transition-colors"
                      onClick={() =>
                        copyToClipboard("A", "Copied to clipboard")
                      }
                      aria-label="Copy record type to clipboard"
                    >
                      <div className="i-mdi:content-copy h-3.5 w-3.5"></div>
                    </button>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-400">Name:</span>{" "}
                  <div className="flex items-center">
                    <span className="text-white">@</span>
                    <button
                      className="ml-1.5 text-gray-400 hover:text-primary-light transition-colors"
                      onClick={() =>
                        copyToClipboard("@", "Copied to clipboard")
                      }
                      aria-label="Copy @ symbol to clipboard"
                    >
                      <div className="i-mdi:content-copy h-3.5 w-3.5"></div>
                    </button>
                  </div>
                </div>
                <div className="text-gray-400">
                  Values (create 4 separate A records):
                </div>
                {[
                  "185.199.108.153",
                  "185.199.109.153",
                  "185.199.110.153",
                  "185.199.111.153",
                ].map(ip => (
                  <div key={ip} className="flex items-center ml-2">
                    <span className="text-white">{ip}</span>
                    <button
                      className="ml-1.5 text-gray-400 hover:text-primary-light transition-colors"
                      onClick={() => copyToClipboard(ip, "Copied to clipboard")}
                      aria-label={`Copy IP address ${ip} to clipboard`}
                    >
                      <div className="i-mdi:content-copy h-3.5 w-3.5"></div>
                    </button>
                  </div>
                ))}
                <div className="flex items-center">
                  <span className="text-gray-400">TTL:</span>{" "}
                  <div className="flex items-center">
                    <span className="text-white">3600</span>
                    <button
                      className="ml-1.5 text-gray-400 hover:text-primary-light transition-colors"
                      onClick={() =>
                        copyToClipboard("3600", "Copied to clipboard")
                      }
                      aria-label="Copy TTL value to clipboard"
                    >
                      <div className="i-mdi:content-copy h-3.5 w-3.5"></div>
                    </button>{" "}
                    (or automatic)
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-base-9/70 rounded p-3 font-mono text-xs overflow-x-auto">
              <div className="mb-2 text-gray-400">
                <span className="text-primary-light">Step 2:</span> Add a{" "}
                <span className="text-primary-light">CNAME record</span> for www
                subdomain{" "}
                <span className="text-warning">
                  (required for SSL certificate)
                </span>
                :
              </div>
              <div className="space-y-1">
                <div className="flex items-center">
                  <span className="text-gray-400">Type:</span>{" "}
                  <div className="flex items-center">
                    <span className="text-white">CNAME</span>
                    <button
                      className="ml-1.5 text-gray-400 hover:text-primary-light transition-colors"
                      onClick={() =>
                        copyToClipboard("CNAME", "Copied to clipboard")
                      }
                      aria-label="Copy record type to clipboard"
                    >
                      <div className="i-mdi:content-copy h-3.5 w-3.5"></div>
                    </button>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-400">Name:</span>{" "}
                  <div className="flex items-center">
                    <span className="text-white">www</span>
                    <button
                      className="ml-1.5 text-gray-400 hover:text-primary-light transition-colors"
                      onClick={() =>
                        copyToClipboard("www", "Copied to clipboard")
                      }
                      aria-label="Copy www to clipboard"
                    >
                      <div className="i-mdi:content-copy h-3.5 w-3.5"></div>
                    </button>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-400">Value:</span>{" "}
                  <div className="flex items-center">
                    <span className="text-white">
                      orderlynetworkdexcreator.github.io
                    </span>
                    <button
                      className="ml-1.5 text-gray-400 hover:text-primary-light transition-colors"
                      onClick={() =>
                        copyToClipboard(
                          "orderlynetworkdexcreator.github.io",
                          "Copied to clipboard"
                        )
                      }
                      aria-label="Copy domain value to clipboard"
                    >
                      <div className="i-mdi:content-copy h-3.5 w-3.5"></div>
                    </button>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-400">TTL:</span>{" "}
                  <div className="flex items-center">
                    <span className="text-white">3600</span>
                    <button
                      className="ml-1.5 text-gray-400 hover:text-primary-light transition-colors"
                      onClick={() =>
                        copyToClipboard("3600", "Copied to clipboard")
                      }
                      aria-label="Copy TTL value to clipboard"
                    >
                      <div className="i-mdi:content-copy h-3.5 w-3.5"></div>
                    </button>{" "}
                    (or automatic)
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : landingPageData.customDomain &&
          landingPageData.customDomain.split(".").length > 2 ? (
          <div className="bg-base-9/70 rounded p-3 font-mono text-xs overflow-x-auto mb-3">
            <div className="mb-1 text-gray-400">
              Add a <span className="text-primary-light">CNAME record</span>{" "}
              with the following values:
            </div>
            <div className="flex items-center">
              <span className="text-gray-400">Name:</span>{" "}
              <div className="flex items-center">
                <span className="text-white">
                  {landingPageData.customDomain.split(".")[0]}
                </span>
                <button
                  className="ml-1.5 text-gray-400 hover:text-primary-light transition-colors"
                  onClick={() =>
                    copyToClipboard(
                      landingPageData.customDomain?.split(".")[0] || "",
                      "Copied to clipboard"
                    )
                  }
                  aria-label="Copy subdomain name to clipboard"
                >
                  <div className="i-mdi:content-copy h-3.5 w-3.5"></div>
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-gray-400">Value:</span>{" "}
              <div className="flex items-center">
                <span className="text-white">
                  orderlynetworkdexcreator.github.io
                </span>
                <button
                  className="ml-1.5 text-gray-400 hover:text-primary-light transition-colors"
                  onClick={() =>
                    copyToClipboard(
                      "orderlynetworkdexcreator.github.io",
                      "Copied to clipboard"
                    )
                  }
                  aria-label="Copy domain value to clipboard"
                >
                  <div className="i-mdi:content-copy h-3.5 w-3.5"></div>
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-gray-400">TTL:</span>{" "}
              <div className="flex items-center">
                <span className="text-white">3600</span>
                <button
                  className="ml-1.5 text-gray-400 hover:text-primary-light transition-colors"
                  onClick={() => copyToClipboard("3600", "Copied to clipboard")}
                  aria-label="Copy TTL value to clipboard"
                >
                  <div className="i-mdi:content-copy h-3.5 w-3.5"></div>
                </button>{" "}
                (or automatic)
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-base-9/70 rounded p-3 font-mono text-xs overflow-x-auto mb-3">
            <div className="mb-2 text-gray-400">
              DNS configuration depends on your domain type. Configure a domain
              first to see specific instructions.
            </div>
          </div>
        )}

        <div className="mb-3 p-3 bg-info/10 rounded-lg border border-info/20">
          <h6 className="text-xs font-medium mb-2 flex items-center">
            <div className="i-mdi:information-outline h-3.5 w-3.5 mr-1.5 text-info"></div>
            Important: About Domain Updates
          </h6>
          <p className="text-xs text-gray-300">
            After adding or removing a custom domain, your landing page will be
            automatically deployed with the updated configuration.
          </p>
        </div>
      </div>
    </div>
  );
}
