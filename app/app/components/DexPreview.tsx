import { FC, useEffect, useState } from "react";
import { WalletConnectorProvider } from "@orderly.network/wallet-connector";
import { OrderlyAppProvider, AppLogos } from "@orderly.network/react-app";
import {
  Scaffold,
  type MainNavWidgetProps,
  type FooterProps,
} from "@orderly.network/ui-scaffold";
import { TradingPage, type TradingPageProps } from "@orderly.network/trading";
import { NetworkId } from "@orderly.network/types";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { API } from "@orderly.network/types";
import type { RouteOption } from "@orderly.network/types";
import PreviewErrorBoundary from "./PreviewErrorBoundary";

export interface DexPreviewProps {
  brokerId: string;
  brokerName: string;
  networkId?: NetworkId;

  mainNavProps?: MainNavWidgetProps;
  footerProps?: FooterProps;

  initialSymbol?: string;
  tradingViewConfig?: TradingPageProps["tradingViewConfig"];
  sharePnLConfig?: TradingPageProps["sharePnLConfig"];

  appIcons?: AppLogos;

  customStyles?: string;
  fontFamily?: string;
  fontSize?: string;

  className?: string;

  onLoad?: () => void;
}

const DexPreview: FC<DexPreviewProps> = ({
  brokerId,
  brokerName,
  networkId,
  mainNavProps = {
    initialMenu: "/",
    mainMenus: [{ name: "Trading", href: "/" }],
  },
  footerProps = {
    telegramUrl: "https://orderly.network",
    discordUrl: "https://discord.com/invite/orderlynetwork",
    twitterUrl: "https://twitter.com/OrderlyNetwork",
  },
  initialSymbol = "PERP_BTC_USDC",
  tradingViewConfig = {
    scriptSRC: "/tradingview/charting_library/charting_library.js",
    library_path: "/tradingview/charting_library/",
    customCssUrl: "/tradingview/chart.css",
  },
  sharePnLConfig = {
    backgroundImages: [
      "/pnl/poster_bg_1.png",
      "/pnl/poster_bg_2.png",
      "/pnl/poster_bg_3.png",
      "/pnl/poster_bg_4.png",
    ],
    color: "rgba(255, 255, 255, 0.98)",
    profitColor: "rgba(41, 223, 169, 1)",
    lossColor: "rgba(245, 97, 139, 1)",
    brandColor: "rgba(255, 255, 255, 0.98)",
    refLink: "https://orderly.network",
    refSlogan: "Orderly referral",
  },
  appIcons,
  customStyles,
  className = "",
  onLoad,
}) => {
  const resolvedNetworkId: NetworkId =
    networkId ||
    (import.meta.env.VITE_DEPLOYMENT_ENV === "mainnet" ? "mainnet" : "testnet");

  const DEFAULT_SYMBOL = "PERP_BTC_USDC";
  const [currentSymbol, setCurrentSymbol] = useState(
    initialSymbol || DEFAULT_SYMBOL
  );

  const onChainChanged = (
    _chainId: number,
    { isTestnet }: { isTestnet: boolean }
  ) => {
    console.log("Chain changed in preview mode:", _chainId, isTestnet);
  };

  const onRouteChange = (option: RouteOption) => {
    console.log("Route change in preview mode:", option);
  };

  const handleSymbolChange = (data: API.Symbol) => {
    console.log("Symbol changed in preview mode:", data.symbol);
    setCurrentSymbol(data.symbol || DEFAULT_SYMBOL);
  };

  useEffect(() => {
    setCurrentSymbol(initialSymbol || DEFAULT_SYMBOL);
  }, [initialSymbol]);

  useEffect(() => {
    const oldOverrideStyles = document.querySelectorAll(
      'style[id^="ai-override-"]'
    );
    oldOverrideStyles.forEach(style => style.remove());

    if (!customStyles) return;

    const fontFamilyMatch = customStyles.match(/--oui-font-family:\s*([^;]+);/);
    if (!fontFamilyMatch) return;

    const fontFamily = fontFamilyMatch[1].trim();
    const styleId = "dex-preview-font-override";

    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      .orderly-app-container,
      .orderly-app-container *,
      .orderly-app-container *::before,
      .orderly-app-container *::after {
        font-family: ${fontFamily} !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      const styleToRemove = document.getElementById(styleId);
      if (styleToRemove) {
        styleToRemove.remove();
      }
    };
  }, [customStyles]);

  useEffect(() => {
    const originalError = console.error;
    const originalWarn = console.warn;

    const errorHandler = (...args: unknown[]) => {
      const errorMessage = args.join(" ");
      if (
        errorMessage.includes("DecimalError") ||
        errorMessage.includes("Invalid argument: Infinity")
      ) {
        console.warn("Suppressed Decimal error in preview:", errorMessage);
        return;
      }
      originalError(...args);
    };

    const warnHandler = (...args: unknown[]) => {
      const warnMessage = args.join(" ");
      if (
        warnMessage.includes("DecimalError") ||
        warnMessage.includes("Invalid argument: Infinity")
      ) {
        return;
      }
      originalWarn(...args);
    };

    console.error = errorHandler;
    console.warn = warnHandler;

    const timer = setTimeout(() => {
      if (onLoad) {
        onLoad();
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, [onLoad]);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (
        event.message.includes("DecimalError") ||
        event.message.includes("Invalid argument: Infinity")
      ) {
        event.preventDefault();
        console.warn("Suppressed Decimal error in preview:", event.message);
        return false;
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.message || String(event.reason || "");
      if (
        reason.includes("DecimalError") ||
        reason.includes("Invalid argument: Infinity")
      ) {
        event.preventDefault();
        console.warn(
          "Suppressed Decimal error promise rejection in preview:",
          reason
        );
        return false;
      }
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
    };
  }, []);

  return (
    <div
      className={`relative h-full w-full orderly-app-container orderly-scrollbar bg-[rgb(var(--oui-color-base-7))] text-[rgb(var(--oui-color-base-foreground))] ${className}`}
    >
      <style
        key={`theme-${customStyles || "empty"}`}
        dangerouslySetInnerHTML={{ __html: customStyles || "" }}
      />

      <WalletConnectorProvider
        solanaInitial={{
          network:
            resolvedNetworkId === "mainnet"
              ? WalletAdapterNetwork.Mainnet
              : WalletAdapterNetwork.Devnet,
        }}
      >
        <OrderlyAppProvider
          brokerId={brokerId}
          brokerName={brokerName}
          networkId={resolvedNetworkId}
          onChainChanged={onChainChanged}
          appIcons={appIcons}
        >
          <Scaffold
            mainNavProps={mainNavProps}
            footerProps={footerProps}
            routerAdapter={{
              onRouteChange,
              currentPath: "/",
            }}
          >
            <PreviewErrorBoundary>
              <TradingPage
                symbol={currentSymbol || DEFAULT_SYMBOL}
                onSymbolChange={handleSymbolChange}
                tradingViewConfig={tradingViewConfig}
                sharePnLConfig={sharePnLConfig}
              />
            </PreviewErrorBoundary>
          </Scaffold>
        </OrderlyAppProvider>
      </WalletConnectorProvider>
    </div>
  );
};

export default DexPreview;
