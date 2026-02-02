import { useState, useEffect } from "react";
import type { MetaFunction } from "@remix-run/node";
import { toast } from "react-toastify";
import { useAuth } from "../context/useAuth";
import { useDex } from "../context/DexContext";
import { useLandingPage } from "../context/LandingPageContext";
import { useModal } from "../context/ModalContext";
import { del } from "../utils/apiClient";
import WalletConnect from "../components/WalletConnect";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { useNavigate, Link } from "@remix-run/react";
import LandingPageCustomDomainSection from "../components/LandingPageCustomDomainSection";

export const meta: MetaFunction = () => [
  { title: "Landing Page - Orderly One" },
  {
    name: "description",
    content:
      "Create and customize your DEX landing page. Configure branding, content, and settings for your landing page.",
  },
];

export default function LandingPageRoute() {
  const { isAuthenticated, token, isLoading } = useAuth();
  const { dexData } = useDex();
  const {
    landingPageData,
    isLoading: isLandingPageLoading,
    refreshLandingPageData,
    clearLandingPageData,
    hasLandingPage,
  } = useLandingPage();
  const { openModal } = useModal();
  const navigate = useNavigate();

  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isAuthenticated && token) {
      refreshLandingPageData();
    }
  }, [isAuthenticated, token, refreshLandingPageData]);

  const handleDelete = async () => {
    if (!landingPageData || !landingPageData.id || !token) {
      toast.error("Landing page information is not available");
      return;
    }

    setIsDeleting(true);

    try {
      await del<{ message: string }>(
        `api/landing-page/${landingPageData.id}`,
        null,
        token
      );
      toast.success("Landing page deleted successfully!");

      clearLandingPageData();
      navigate("/dex");
    } catch (error) {
      console.error("Error deleting landing page:", error);
      toast.error("Failed to delete the landing page. Please try again later.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShowDeleteConfirm = () => {
    openModal("deleteConfirm", {
      onConfirm: handleDelete,
      entityName: "landing page",
    });
  };

  const handleShowDomainRemoveConfirm = () => {
    openModal("deleteConfirm", {
      onConfirm: async () => {
        if (!landingPageData || !landingPageData.id || !token) {
          toast.error("Landing page information is not available");
          return;
        }

        setIsSaving(true);
        try {
          await del<{ message: string }>(
            `api/landing-page/${landingPageData.id}/custom-domain`,
            null,
            token
          );
          toast.success("Custom domain removed successfully");
          await refreshLandingPageData();
        } catch (error) {
          console.error("Error removing custom domain:", error);
          toast.error("Failed to remove custom domain");
        } finally {
          setIsSaving(false);
        }
      },
      entityName: "custom domain",
    });
  };

  if (isLoading || isLandingPageLoading) {
    return (
      <div className="w-full h-[calc(100vh-64px)] flex items-center justify-center px-4 mt-26 pb-52">
        <div className="text-center">
          <div className="i-svg-spinners:pulse-rings-multiple h-12 w-12 mx-auto text-primary-light mb-4"></div>
          <div className="text-base md:text-lg mb-2">
            Loading your landing page
          </div>
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
        <div className="mb-8">
          <Link
            to="/dex"
            className="text-sm text-gray-400 hover:text-primary-light mb-2 inline-flex items-center"
          >
            <div className="i-mdi:arrow-left h-4 w-4 mr-1"></div>
            Back to DEX Dashboard
          </Link>
        </div>
        <div className="text-center">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4 md:mb-6">
            Create Your Landing Page
          </h1>
          <h2 className="text-lg md:text-xl mb-6">
            Build a beautiful landing page for your DEX
          </h2>
          <div className="text-base-contrast-54 mt-4 mb-15">
            <p>Create a professional landing page to showcase your DEX.</p>
            <p>Customize branding, content, and settings to attract traders.</p>
          </div>

          <Card>
            <h2 className="text-md md:text-2xl font-medium mb-3 md:mb-4 text-base-contrast">
              Connect your wallet to get started
            </h2>
            <p className="px-10 mb-4 md:mb-6 text-xs md:text-sm text-base-contrast-54">
              Authentication required. Please connect your wallet and login to
              create and manage your landing page
            </p>
            <div className="flex justify-center">
              <WalletConnect />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!dexData) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-6 md:py-10 mt-26 pb-52">
        <Card className="bg-warning/10 border border-warning/30">
          <div className="text-center">
            <div className="i-mdi:warning text-warning h-12 w-12 mx-auto mb-4"></div>
            <h2 className="text-xl md:text-2xl font-bold mb-4">DEX Required</h2>
            <p className="text-gray-300 mb-6">
              You need to create a DEX first before you can set up a landing
              page.
            </p>
            <Button as="a" href="/dex" className="whitespace-nowrap">
              Create Your DEX
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!hasLandingPage) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-6 md:py-10 mt-26 pb-52">
        <div className="mb-8">
          <Link
            to="/dex"
            className="text-sm text-gray-400 hover:text-primary-light mb-2 inline-flex items-center"
          >
            <div className="i-mdi:arrow-left h-4 w-4 mr-1"></div>
            Back to DEX Dashboard
          </Link>
        </div>
        <div className="text-center">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4 md:mb-6">
            Create Your Landing Page
          </h1>
          <h2 className="text-lg md:text-xl mb-6">
            Build a beautiful landing page for your DEX
          </h2>
          <div className="text-base-contrast-54 mt-4 mb-15">
            <p>Create a professional landing page to showcase your DEX.</p>
            <p>Customize branding, content, and settings to attract traders.</p>
          </div>

          <Card>
            <h2 className="text-md md:text-2xl font-medium mb-3 md:mb-4 text-base-contrast">
              Get Started
            </h2>
            <p className="px-10 mb-4 md:mb-6 text-xs md:text-sm text-base-contrast-54">
              Create your landing page to start attracting traders to your DEX
            </p>
            <div className="flex justify-center">
              <Button
                as="a"
                href="/dex/page/config"
                className="whitespace-nowrap"
              >
                Create Landing Page
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl mt-26 pb-52">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <Link
            to="/dex"
            className="text-sm text-gray-400 hover:text-primary-light mb-2 inline-flex items-center"
          >
            <div className="i-mdi:arrow-left h-4 w-4 mr-1"></div>
            Back to DEX Dashboard
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold gradient-text">
            Manage Your Landing Page
          </h1>
        </div>
      </div>

      <div className="space-y-8">
        {landingPageData && (
          <Card className="my-6 bg-gradient-to-r from-secondary/20 to-primary/20 border border-secondary/30">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 bg-secondary/20 p-2 rounded-full">
                  <div className="i-mdi:cog text-secondary w-6 h-6"></div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">
                    Configure Your Landing Page
                  </h3>
                  <p className="text-gray-300">
                    Customize branding, content, sections, and advanced settings
                    for your landing page.
                  </p>
                </div>
              </div>
              <Button
                as="a"
                href="/dex/page/config"
                className="whitespace-nowrap flex-shrink-0"
              >
                Open Settings
              </Button>
            </div>
          </Card>
        )}

        {landingPageData && landingPageData.repoUrl && (
          <Card className="my-6 bg-gradient-to-r from-success/20 to-primary/20 border border-success/30">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 bg-success/20 p-2 rounded-full">
                  <div className="i-mdi:check-circle text-success w-6 h-6"></div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">
                    Landing Page Published
                  </h3>
                  <p className="text-gray-300">
                    Your landing page is live and accessible to visitors.
                  </p>
                  <div className="flex flex-col gap-1 mt-1">
                    <a
                      href={landingPageData.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-gray-300 hover:underline text-xs inline-block"
                    >
                      View Repository →
                    </a>
                  </div>
                </div>
              </div>
              <Button
                as="a"
                href={
                  landingPageData.customDomain
                    ? `https://${landingPageData.customDomain}`
                    : `https://dex.orderly.network/landing-page-${landingPageData.repoIdentifier}`
                }
                target="_blank"
                rel="noopener noreferrer"
                variant="success"
                className="whitespace-nowrap flex-shrink-0"
              >
                Visit Page
              </Button>
            </div>
          </Card>
        )}

        {landingPageData && landingPageData.repoUrl && (
          <Card>
            <LandingPageCustomDomainSection
              landingPageData={landingPageData}
              token={token}
              isSaving={isSaving}
              onLandingPageUpdate={refreshLandingPageData}
              onSavingChange={setIsSaving}
              onShowDomainRemoveConfirm={handleShowDomainRemoveConfirm}
            />
          </Card>
        )}

        <Card>
          <h3 className="text-lg font-bold mb-4 text-red-400">Danger Zone</h3>
          <div className="border border-red-500/20 rounded-lg p-4 bg-red-500/5">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h4 className="font-medium text-red-400 mb-1">
                  Delete Landing Page
                </h4>
                <p className="text-sm text-gray-400">
                  Permanently delete your landing page configuration. This
                  action cannot be undone.
                </p>
              </div>
              <Button
                variant="danger"
                onClick={handleShowDeleteConfirm}
                disabled={isDeleting}
                className="whitespace-nowrap"
              >
                {isDeleting ? "Deleting..." : "Delete Landing Page"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
