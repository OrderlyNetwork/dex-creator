import { useMemo, useState } from "react";
import { useTranslation, i18n } from "~/i18n";
import SystemStatus from "./SystemStatus";

export default function Footer() {
  const { t } = useTranslation();
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  // TODO: define others section links here instead of hardcoding them
  const URLS = useMemo(() => {
    return {
      legal: [
        {
          title: t("footer.privacyPolicy"),
          href: "https://orderly.network/docs/introduction/privacy-policy",
        },
        {
          title: t("footer.termsOfService"),
          href: "https://orderly.network/docs/introduction/terms-of-service",
        },
        {
          title: t("footer.builderGuidelines"),
          href: "https://orderly.network/docs/introduction/orderly-one/builder-guidelines",
        },
        {
          title: t("footer.supplementalTermsForDexs"),
          href: "https://orderly.network/docs/introduction/orderly-one/supplemental-terms-for-dexes",
        },
      ],
    };
  }, [t]);

  const toggleSection = (section: string) => {
    const newOpenSections = new Set(openSections);
    if (newOpenSections.has(section)) {
      newOpenSections.delete(section);
    } else {
      newOpenSections.add(section);
    }
    setOpenSections(newOpenSections);
  };

  return (
    <>
      <div className="pt-[20px] border-t-[1px] border-base-contrast-12 md:hidden">
        <div className="px-[20px]">
          <div className="flex justify-between items-center">
            <a href="/">
              <img src="/orderly.min.svg" alt="Orderly" className="w-10 h-10" />
            </a>
            <SystemStatus isMaintenance={false} />
          </div>
          <div className="select-none mt-[20px]">
            <div className="text-gray-400 text-sm py-[24px] cursor-pointer border-t-[1px] border-base-contrast-12">
              <div
                className="flex justify-between items-center"
                onClick={() => toggleSection("developers")}
              >
                {t("footer.developers")}
                <svg
                  width="24"
                  height="25"
                  viewBox="0 0 24 25"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`transition duration-300 ${openSections.has("developers") ? "rotate-180" : "rotate-0"}`}
                >
                  <path d="M7.41 8.59L12 13.17L16.59 8.59L18 10L12 16L6 10L7.41 8.59Z" />
                </svg>
              </div>
              {openSections.has("developers") && (
                <div className="mt-[16px] space-y-[12px]">
                  <a
                    href="https://orderly.network/docs/getting-started/what-is-orderly-network"
                    target="_blank"
                    className="block text-gray-400 hover:text-gray-300"
                  >
                    {t("footer.documentation")}
                  </a>
                  <a
                    href="https://github.com/OrderlyNetwork"
                    target="_blank"
                    className="block text-gray-400 hover:text-gray-300"
                  >
                    {t("footer.github")}
                  </a>
                  <a
                    href="https://orderly.network/docs/sdks/overview"
                    target="_blank"
                    className="block text-gray-400 hover:text-gray-300"
                  >
                    {t("footer.orderlySdks")}
                  </a>
                </div>
              )}
            </div>
            <div className="text-gray-400 text-sm py-[24px] cursor-pointer border-t-[1px] border-base-contrast-12">
              <div
                className="flex justify-between items-center"
                onClick={() => toggleSection("traders")}
              >
                {t("footer.traders")}
                <svg
                  width="24"
                  height="25"
                  viewBox="0 0 24 25"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`transition duration-300 ${openSections.has("traders") ? "rotate-180" : "rotate-0"}`}
                >
                  <path d="M7.41 8.59L12 13.17L16.59 8.59L18 10L12 16L6 10L7.41 8.59Z" />
                </svg>
              </div>
              {openSections.has("traders") && (
                <div className="mt-[16px] space-y-[12px]">
                  <a
                    href="https://orderly.network/docs/introduction/trade-on-orderly/builders"
                    className="block text-gray-400 hover:text-gray-300"
                  >
                    {t("footer.tradeOnBuilders")}
                  </a>
                  <a
                    href="https://explorer.orderly.network/"
                    target="_blank"
                    className="block text-gray-400 hover:text-gray-300"
                  >
                    {t("footer.orderlyExplorer")}
                  </a>
                  <a
                    href="https://orderly-dashboard.orderly.network"
                    target="_blank"
                    className="block text-gray-400 hover:text-gray-300"
                  >
                    {t("footer.orderlyDashboard")}
                  </a>
                  <a
                    href="https://orderly.network/docs/build-on-evm/evm-api/introduction"
                    target="_blank"
                    className="block text-gray-400 hover:text-gray-300"
                  >
                    {t("footer.apiDocs")}
                  </a>
                </div>
              )}
            </div>
            <div className="text-gray-400 text-sm py-[24px] cursor-pointer border-t-[1px] border-base-contrast-12">
              <div
                className="flex justify-between items-center"
                onClick={() => toggleSection("ecosystem")}
              >
                {t("footer.ecosystem")}
                <svg
                  width="24"
                  height="25"
                  viewBox="0 0 24 25"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`transition duration-300 ${openSections.has("ecosystem") ? "rotate-180" : "rotate-0"}`}
                >
                  <path d="M7.41 8.59L12 13.17L16.59 8.59L18 10L12 16L6 10L7.41 8.59Z" />
                </svg>
              </div>
              {openSections.has("ecosystem") && (
                <div className="mt-[16px] space-y-[12px]">
                  <a
                    href="https://orderly.network/partners"
                    target="_blank"
                    className="block text-gray-400 hover:text-gray-300"
                  >
                    {t("footer.partners")}
                  </a>
                  <a
                    href="https://orderly.network/blog"
                    target="_blank"
                    className="block text-gray-400 hover:text-gray-300"
                  >
                    {t("footer.blog")}
                  </a>
                  <a
                    href="https://orderly.network/listing"
                    target="_blank"
                    className="block text-gray-400 hover:text-gray-300"
                  >
                    {t("footer.listing")}
                  </a>
                </div>
              )}
            </div>
            <div className="text-gray-400 text-sm py-[24px] cursor-pointer border-t-[1px] border-base-contrast-12">
              <div
                className="flex justify-between items-center"
                onClick={() => toggleSection("about")}
              >
                {t("footer.about")}
                <svg
                  width="24"
                  height="25"
                  viewBox="0 0 24 25"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`transition duration-300 ${openSections.has("about") ? "rotate-180" : "rotate-0"}`}
                >
                  <path d="M7.41 8.59L12 13.17L16.59 8.59L18 10L12 16L6 10L7.41 8.59Z" />
                </svg>
              </div>
              {openSections.has("about") && (
                <div className="mt-[16px] space-y-[12px]">
                  <a
                    href="https://orderly.network/team"
                    target="_blank"
                    className="block text-gray-400 hover:text-gray-300"
                  >
                    {t("footer.team")}
                  </a>
                  <a
                    href="https://dune.com/orderly_network/orderly-dashboard"
                    target="_blank"
                    className="block text-gray-400 hover:text-gray-300"
                  >
                    {t("footer.analytics")}
                  </a>
                  <a
                    href="https://coral-shark-13c.notion.site/orderly-brand-kit-2025"
                    target="_blank"
                    className="block text-gray-400 hover:text-gray-300"
                  >
                    {t("footer.pressKit")}
                  </a>
                  <a
                    href="https://job-boards.greenhouse.io/orderly"
                    target="_blank"
                    className="block text-gray-400 hover:text-gray-300"
                  >
                    {t("footer.careers")}
                  </a>
                </div>
              )}
            </div>
            <div className="text-gray-400 text-sm py-[24px] cursor-pointer border-t-[1px] border-base-contrast-12">
              <div
                className="flex justify-between items-center"
                onClick={() => toggleSection("legal")}
              >
                {t("footer.legal")}
                <svg
                  width="24"
                  height="25"
                  viewBox="0 0 24 25"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`transition duration-300 ${openSections.has("legal") ? "rotate-180" : "rotate-0"}`}
                >
                  <path d="M7.41 8.59L12 13.17L16.59 8.59L18 10L12 16L6 10L7.41 8.59Z" />
                </svg>
              </div>
              {openSections.has("legal") && (
                <div className="mt-[16px] space-y-[12px]">
                  {URLS.legal.map(item => (
                    <a
                      href={item.href}
                      className="block text-gray-400 hover:text-gray-300"
                      key={item.href}
                    >
                      {item.title}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="pt-[40px] lg:pt-[60px] border-t-[1px] border-base-contrast-12 hidden md:block">
        <div className="md:max-w-[688px] lg:max-w-[904px] 2xl:max-w-[1280px] 2xl:flex m-auto 2xl:items-center 2xl:gap-20">
          <div className="flex justify-between items-center 2xl:flex-col 2xl:items-start 2xl:shrink-0 2xl:self-stretch 2xl:pt-2 2xl:pb-5">
            <a href="/">
              <img src="/orderly.min.svg" alt="Orderly" className="size-10" />
            </a>
            <SystemStatus isMaintenance={false} />
          </div>
          <div className="flex justify-between mt-[60px] 2xl:mt-0 2xl:w-full">
            <div className="text-sm font-bold">
              {t("footer.developers")}
              <div className="flex flex-col mt-[8px] font-normal text-gray-300">
                <a
                  href="https://orderly.network/docs/getting-started/what-is-orderly-network"
                  target="_blank"
                  className="text-gray-400 hover:text-gray-300 my-[8px]"
                >
                  {t("footer.documentation")}
                </a>
                <a
                  href="https://github.com/OrderlyNetwork"
                  target="_blank"
                  className="text-gray-400 hover:text-gray-300 my-[8px]"
                >
                  {t("footer.github")}
                </a>
                <a
                  href="https://orderly.network/docs/sdks/overview"
                  target="_blank"
                  className="text-gray-400 hover:text-gray-300 my-[8px]"
                >
                  {t("footer.orderlySdks")}
                </a>
              </div>
            </div>
            <div className="text-sm font-bold">
              {t("footer.traders")}
              <div className="flex flex-col mt-[8px] font-normal text-gray-300">
                <a
                  href="https://orderly.network/docs/introduction/trade-on-orderly/builders"
                  className="text-gray-400 hover:text-gray-300 my-[8px]"
                >
                  {t("footer.tradeOnBuilders")}
                </a>
                <a
                  href="https://explorer.orderly.network/"
                  target="_blank"
                  className="text-gray-400 hover:text-gray-300 my-[8px]"
                >
                  {t("footer.orderlyExplorer")}
                </a>
                <a
                  href="https://orderly-dashboard.orderly.network"
                  target="_blank"
                  className="text-gray-400 hover:text-gray-300 my-[8px]"
                >
                  {t("footer.orderlyDashboard")}
                </a>
                <a
                  href="https://orderly.network/docs/build-on-evm/evm-api/introduction"
                  target="_blank"
                  className="text-gray-400 hover:text-gray-300 my-[8px]"
                >
                  {t("footer.apiDocs")}
                </a>
              </div>
            </div>
            <div className="text-sm font-bold">
              {t("footer.ecosystem")}
              <div className="flex flex-col mt-[8px] font-normal text-gray-300">
                <a
                  href="https://orderly.network/partners"
                  target="_blank"
                  className="text-gray-400 hover:text-gray-300 my-[8px]"
                >
                  {t("footer.partners")}
                </a>
                <a
                  href="https://orderly.network/blog"
                  target="_blank"
                  className="text-gray-400 hover:text-gray-300 my-[8px]"
                >
                  {t("footer.blog")}
                </a>
                <a
                  href="https://orderly.network/listing"
                  target="_blank"
                  className="text-gray-400 hover:text-gray-300 my-[8px]"
                >
                  {t("footer.listing")}
                </a>
              </div>
            </div>
            <div className="text-sm font-bold">
              {t("footer.about")}
              <div className="flex flex-col mt-[8px] font-normal text-gray-300">
                <a
                  href="https://orderly.network/team"
                  target="_blank"
                  className="text-gray-400 hover:text-gray-300 my-[8px]"
                >
                  {t("footer.team")}
                </a>
                <a
                  href="https://dune.com/orderly_network/orderly-dashboard"
                  target="_blank"
                  className="text-gray-400 hover:text-gray-300 my-[8px]"
                >
                  {t("footer.analytics")}
                </a>
                <a
                  href="https://coral-shark-13c.notion.site/orderly-brand-kit-2025"
                  target="_blank"
                  className="text-gray-400 hover:text-gray-300 my-[8px]"
                >
                  {t("footer.pressKit")}
                </a>
                <a
                  href="https://job-boards.greenhouse.io/orderly"
                  target="_blank"
                  className="text-gray-400 hover:text-gray-300 my-[8px]"
                >
                  {t("footer.careers")}
                </a>
              </div>
            </div>
            <div className="text-sm font-bold">
              {t("footer.legal")}
              <div className="flex flex-col mt-[8px] font-normal text-gray-300">
                {URLS.legal.map(item => (
                  <a
                    href={item.href}
                    className="text-gray-400 hover:text-gray-300 my-[8px]"
                    key={item.href}
                  >
                    {item.title}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-[48px] lg:mt-[68px] border-t-[1px] border-base-contrast-12">
        <div className="flex justify-between px-4 py-8 md:max-w-[688px] lg:max-w-[904px] m-auto">
          <div className="text-sm text-[#8C8C8C]">
            {/* i18n-ignore */}© 2025 Orderly.
          </div>
          <div className="flex items-center">
            <a
              className="text-gray-400 hover:text-gray-300 pl-[16px]"
              href="https://snapshot.box/#/s:orderlygov.eth"
              target="_blank"
            >
              <svg
                width="16px"
                height="16px"
                viewBox="0 0 17 17"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M14.7913 7.18131C14.7344 7.02879 14.5885 6.92737 14.4255 6.92737H9.71527L12.4322 1.64491C12.5176 1.47873 12.4735 1.2755 12.3264 1.16004C12.2555 1.10387 12.17 1.07617 12.085 1.07617C11.9941 1.07617 11.9032 1.10816 11.8303 1.17096L8.96437 3.64602L3.24857 8.58248C3.12531 8.68897 3.08084 8.86099 3.13779 9.01351C3.19474 9.16604 3.34024 9.26785 3.50329 9.26785H8.21347L5.49659 14.5503C5.41116 14.7165 5.45524 14.9197 5.6023 15.0352C5.67329 15.0913 5.75872 15.119 5.84376 15.119C5.93464 15.119 6.02553 15.0871 6.09848 15.0243L8.96437 12.5492L14.6802 7.61274C14.8038 7.50625 14.8479 7.33422 14.7913 7.18131Z"></path>
              </svg>
            </a>
            <a
              className="text-gray-400 hover:text-gray-300 pl-[16px]"
              href="https://discord.com/invite/orderlynetwork"
            >
              <svg
                width="16px"
                height="16px"
                viewBox="0 0 16 13"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M13.5447 1.71016C12.5249 1.24224 11.4313 0.897496 10.2879 0.700047C10.2671 0.696236 10.2463 0.705759 10.2356 0.724806C10.0949 0.97495 9.93915 1.30128 9.83006 1.55778C8.60027 1.37367 7.37679 1.37367 6.17221 1.55778C6.0631 1.29558 5.90166 0.97495 5.76038 0.724806C5.74966 0.706395 5.72886 0.696872 5.70803 0.700047C4.56527 0.896865 3.47171 1.24161 2.45129 1.71016C2.44246 1.71397 2.43488 1.72032 2.42986 1.72857C0.355594 4.82748 -0.212633 7.85022 0.0661201 10.8355C0.0673814 10.8501 0.0755799 10.8641 0.086932 10.8729C1.45547 11.878 2.78114 12.4881 4.08219 12.8925C4.10301 12.8989 4.12507 12.8913 4.13832 12.8741C4.44608 12.4538 4.72043 12.0107 4.95565 11.5446C4.96953 11.5174 4.95628 11.485 4.92791 11.4742C4.49275 11.3091 4.0784 11.1078 3.67982 10.8793C3.64829 10.8609 3.64577 10.8158 3.67477 10.7942C3.75865 10.7313 3.84255 10.6659 3.92264 10.5999C3.93713 10.5879 3.95732 10.5853 3.97435 10.5929C6.59286 11.7884 9.4277 11.7884 12.0153 10.5929C12.0323 10.5847 12.0525 10.5872 12.0677 10.5993C12.1478 10.6653 12.2316 10.7313 12.3161 10.7942C12.3451 10.8158 12.3433 10.8609 12.3117 10.8793C11.9131 11.1123 11.4988 11.3091 11.063 11.4735C11.0346 11.4843 11.022 11.5174 11.0359 11.5446C11.2762 12.01 11.5505 12.4532 11.8526 12.8735C11.8652 12.8913 11.8879 12.8989 11.9087 12.8925C13.2161 12.4881 14.5417 11.878 15.9103 10.8729C15.9223 10.8641 15.9298 10.8507 15.9311 10.8361C16.2647 7.38482 15.3723 4.38687 13.5655 1.7292C13.5611 1.72032 13.5535 1.71397 13.5447 1.71016ZM5.34668 9.01777C4.55833 9.01777 3.90876 8.294 3.90876 7.40515C3.90876 6.51629 4.54574 5.79253 5.34668 5.79253C6.15392 5.79253 6.79721 6.52265 6.78459 7.40515C6.78459 8.294 6.14761 9.01777 5.34668 9.01777ZM10.6632 9.01777C9.87484 9.01777 9.22526 8.294 9.22526 7.40515C9.22526 6.51629 9.86222 5.79253 10.6632 5.79253C11.4704 5.79253 12.1137 6.52265 12.1011 7.40515C12.1011 8.294 11.4704 9.01777 10.6632 9.01777Z"></path>
              </svg>
            </a>
            <a
              className="text-gray-400 hover:text-gray-300 pl-[16px]"
              href="https://t.me/Orderly_Discussions"
              target="_blank"
            >
              <svg
                width="16"
                height="17"
                viewBox="0 0 16 17"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clip-path="url(#clip0_4349_1200)">
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M16 8.93961C16 13.3579 12.4183 16.9396 8 16.9396C3.58172 16.9396 0 13.3579 0 8.93961C0 4.52133 3.58172 0.939606 8 0.939606C12.4183 0.939606 16 4.52133 16 8.93961ZM8.28668 6.84556C7.50857 7.1692 5.95342 7.83907 3.62126 8.85515C3.24256 9.00575 3.04417 9.15308 3.02611 9.29714C2.99559 9.5406 3.30047 9.63647 3.71565 9.76702C3.77212 9.78478 3.83064 9.80318 3.89062 9.82268C4.29909 9.95545 4.84855 10.1108 5.13419 10.117C5.3933 10.1226 5.68249 10.0157 6.00176 9.7965C8.18077 8.32561 9.30559 7.58215 9.37621 7.56612C9.42603 7.55481 9.49507 7.54059 9.54184 7.58217C9.58862 7.62375 9.58402 7.70249 9.57907 7.72361C9.54886 7.85237 8.35208 8.965 7.73275 9.54079C7.53967 9.72029 7.40272 9.84762 7.37472 9.8767C7.312 9.94184 7.24809 10.0035 7.18665 10.0627C6.80718 10.4285 6.52261 10.7028 7.20241 11.1508C7.52909 11.3661 7.79051 11.5441 8.05131 11.7217C8.33612 11.9157 8.62019 12.1091 8.98774 12.35C9.08139 12.4114 9.17082 12.4752 9.25793 12.5373C9.58938 12.7736 9.88717 12.9859 10.2551 12.952C10.4688 12.9324 10.6896 12.7313 10.8018 12.1318C11.0668 10.715 11.5878 7.64524 11.7081 6.38025C11.7187 6.26943 11.7054 6.12759 11.6948 6.06532C11.6841 6.00306 11.6618 5.91434 11.5809 5.84867C11.4851 5.7709 11.3371 5.7545 11.2709 5.75566C10.97 5.76096 10.5084 5.92148 8.28668 6.84556Z"
                  ></path>
                </g>
                <defs>
                  <clipPath id="clip0_4349_1200">
                    <rect
                      width="16"
                      height="16"
                      fill="white"
                      transform="translate(0 0.939606)"
                    ></rect>
                  </clipPath>
                </defs>
              </svg>
            </a>
            <a
              className="text-gray-400 hover:text-gray-300 pl-[16px]"
              href="https://x.com/OrderlyNetwork"
            >
              <svg
                width="16px"
                height="16px"
                viewBox="0 0 16 17"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12.2174 2.20898H14.4663L9.55298 7.82465L15.3332 15.4663H10.8073L7.26253 10.8317L3.20647 15.4663H0.956125L6.21146 9.45971L0.666504 2.20898H5.30724L8.51143 6.44521L12.2174 2.20898ZM11.428 14.1202H12.6742L4.6301 3.48441H3.29281L11.428 14.1202Z"></path>
              </svg>
            </a>
            <a
              className="text-gray-400 hover:text-gray-300 pl-[16px]"
              href="https://medium.com/@orderlynetwork"
            >
              <svg
                width="16px"
                height="16px"
                viewBox="0 0 16 17"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clip-path="url(#clip0_2191_6106)">
                  <path d="M16 8.82492C16 10.9445 15.6448 12.6638 15.2065 12.6638C14.7682 12.6638 14.4131 10.9449 14.4131 8.82492C14.4131 6.70491 14.7683 4.98608 15.2065 4.98608C15.6446 4.98608 16 6.70476 16 8.82492Z"></path>
                  <path d="M13.975 8.82472C13.975 11.1909 12.9648 13.1099 11.7187 13.1099C10.4726 13.1099 9.4624 11.1909 9.4624 8.82472C9.4624 6.45851 10.4724 4.53955 11.7185 4.53955C12.9646 4.53955 13.9748 6.45789 13.9748 8.82472"></path>
                  <path d="M9.02496 8.82475C9.02496 11.3386 7.00463 13.3764 4.51256 13.3764C2.02049 13.3764 0 11.3381 0 8.82475C0 6.3114 2.02033 4.27295 4.51256 4.27295C7.00478 4.27295 9.02496 6.31094 9.02496 8.82475Z"></path>
                </g>
                <defs>
                  <clipPath id="clip0_2191_6106">
                    <rect
                      width="16"
                      height="16"
                      transform="translate(0 0.939697)"
                    ></rect>
                  </clipPath>
                </defs>
              </svg>
            </a>
            <a
              className="text-gray-400 hover:text-gray-300 pl-[16px]"
              href="https://www.linkedin.com/company/orderly-network"
            >
              <svg
                width="16px"
                height="16px"
                viewBox="0 0 16 17"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M14.8156 0.939697H1.18125C0.528125 0.939697 0 1.45532 0 2.09282V15.7834C0 16.4209 0.528125 16.9397 1.18125 16.9397H14.8156C15.4688 16.9397 16 16.4209 16 15.7866V2.09282C16 1.45532 15.4688 0.939697 14.8156 0.939697ZM4.74687 14.5741H2.37188V6.93657H4.74687V14.5741ZM3.55938 5.89595C2.79688 5.89595 2.18125 5.28032 2.18125 4.52095C2.18125 3.76157 2.79688 3.14595 3.55938 3.14595C4.31875 3.14595 4.93437 3.76157 4.93437 4.52095C4.93437 5.2772 4.31875 5.89595 3.55938 5.89595ZM13.6344 14.5741H11.2625V10.8616C11.2625 9.9772 11.2469 8.83657 10.0281 8.83657C8.79375 8.83657 8.60625 9.8022 8.60625 10.7991V14.5741H6.2375V6.93657H8.5125V7.98032H8.54375C8.85938 7.38032 9.63438 6.74595 10.7875 6.74595C13.1906 6.74595 13.6344 8.3272 13.6344 10.3834V14.5741Z"></path>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
