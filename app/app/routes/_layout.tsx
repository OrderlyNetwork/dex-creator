import { Link, Outlet } from "@remix-run/react";
import WalletConnect from "../components/WalletConnect";
import { ModalProvider } from "../context/ModalContext";
import { AuthProvider } from "../context/AuthContext";
import { DexProvider } from "../context/DexContext";
import { OrderlyKeyProvider } from "../context/OrderlyKeyContext";
import { ThemeGenerationProvider } from "../context/ThemeGenerationContext";
import { AppKitProvider } from "../components/AppKitProvider";
import Navigation from "../components/Navigation";
import MobileNavigation from "../components/MobileNavigation";
import { ToastContainer } from "react-toastify";
import { useState } from "react";
import { useEffect } from "react";
import Footer from "../components/Footer";
import { ChainsSelect } from "../components/ChainsSelect";
import { DistributorProvider } from "../context/DistributorContext";
import { useGoogleAnalysis } from "../hooks/useGoogleAnalysis";
import { TooltipProvider } from "../components/tooltip";
import { ModalProvider as OrderlyModalProvider } from "@orderly.network/ui";
import { LanguageSwitcherWidget } from "~/components/languageSwitcher";
import { LocaleProvider } from "~/i18n";

/**
 * This is a minimal layout route for preview content.
 * It contains no app chrome, headers, footers, or providers.
 * It just renders the child route content directly.
 */
export default function Layout() {
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useGoogleAnalysis();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  return (
    <LocaleProvider>
      <AppKitProvider>
        <AuthProvider>
          <DexProvider>
            <OrderlyKeyProvider>
              <DistributorProvider>
                <ThemeGenerationProvider>
                  <ModalProvider>
                    <OrderlyModalProvider>
                      <TooltipProvider>
                        <div className="flex flex-col h-full">
                          <header className="fixed top-0 left-0 right-0 z-49 bg-gradient-to-b from-purple-900/80 to-transparent backdrop-blur-[1px]">
                            <div className="flex justify-between items-center py-4 px-4 md:py-6 md:px-8">
                              <div className="flex items-center justify-between flex-1 mr-8">
                                <Link to="/">
                                  <img
                                    src="/orderly-one.min.svg"
                                    alt="Orderly One"
                                    className="w-auto h-auto max-h-9 lg:max-h-10 hidden md:block max-w-full"
                                  />
                                  <img
                                    src="/orderly-one-small.svg"
                                    alt="Orderly One"
                                    className="h-9 md:hidden"
                                  />
                                </Link>
                                <div className="hidden md:block ml-8">
                                  <Navigation />
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <LanguageSwitcherWidget />

                                <ChainsSelect />
                                <WalletConnect />
                                {isMobile && (
                                  <MobileNavigation
                                    isOpen={isMobileNavOpen}
                                    setIsOpen={setIsMobileNavOpen}
                                  />
                                )}
                              </div>
                            </div>
                          </header>

                          <main>
                            <Outlet />
                            <Footer />
                          </main>

                          {/* Mobile Navigation Overlay - Outside header for full-screen coverage */}
                          {isMobile && isMobileNavOpen && (
                            <div
                              className="fixed inset-0 bg-background-dark/80 backdrop-blur-sm z-[120]"
                              style={{
                                clipPath:
                                  "polygon(0 0, calc(100% - 256px) 0, calc(100% - 256px) 100%, 0 100%)",
                              }}
                              onClick={() => setIsMobileNavOpen(false)}
                            ></div>
                          )}
                        </div>

                        <ToastContainer
                          position="top-right"
                          autoClose={5000}
                          hideProgressBar={false}
                          newestOnTop
                          closeOnClick
                          rtl={false}
                          pauseOnFocusLoss
                          draggable
                          pauseOnHover
                          theme="dark"
                        />
                      </TooltipProvider>
                    </OrderlyModalProvider>
                  </ModalProvider>
                </ThemeGenerationProvider>
              </DistributorProvider>
            </OrderlyKeyProvider>
          </DexProvider>
        </AuthProvider>
      </AppKitProvider>
    </LocaleProvider>
  );
}
