import { Link, Outlet } from "@remix-run/react";
import WalletConnect from "../components/WalletConnect";
import { ModalProvider } from "../context/ModalContext";
import { AuthProvider } from "../context/AuthContext";
import { DexProvider } from "../context/DexContext";
import { OrderlyKeyProvider } from "../context/OrderlyKeyContext";
import { AppKitProvider } from "../components/AppKitProvider";
import Navigation from "../components/Navigation";
import MobileNavigation from "../components/MobileNavigation";
import { ToastContainer } from "react-toastify";
import { useState } from "react";
import { useEffect } from "react";
import Footer from "../components/Footer";
import { useInitAmplitude } from "../hooks/useInitAmplitude";
import { ChainsSelect } from "../components/ChainsSelect";

/**
 * This is a minimal layout route for preview content.
 * It contains no app chrome, headers, footers, or providers.
 * It just renders the child route content directly.
 */
export default function Layout() {
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useInitAmplitude();

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
    <AppKitProvider>
      <AuthProvider>
        <DexProvider>
          <OrderlyKeyProvider>
            <ModalProvider>
              <div className="flex flex-col h-full">
                <header className="fixed top-0 left-0 right-0 z-100 bg-gradient-to-b from-purple-900/80 to-transparent backdrop-blur-[1px]">
                  <div className="flex justify-between items-center py-4 px-4 md:py-6 md:px-8">
                    <div className="flex items-center justify-between w-full mr-8">
                      <Link to="/">
                        <img
                          src="/orderly-one.min.svg"
                          alt="Orderly One"
                          className="h-9 lg:h-10 hidden md:block"
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
            </ModalProvider>
          </OrderlyKeyProvider>
        </DexProvider>
      </AuthProvider>
    </AppKitProvider>
  );
}
