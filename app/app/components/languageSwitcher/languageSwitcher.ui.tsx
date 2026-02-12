import { FC, SVGProps, forwardRef } from "react";
import {
  cn,
  Flex,
  Text,
  Box,
  Spinner,
  SimpleDialog,
  useScreen,
  SimpleSheet,
} from "@orderly.network/ui";
import { LanguageSwitcherScriptReturn } from "./languageSwitcher.script";
import { Language, useTranslation } from "~/i18n";

export type LanguageSwitcherProps = LanguageSwitcherScriptReturn;

export const LanguageSwitcher: FC<LanguageSwitcherProps> = props => {
  const { languages } = props;
  const { t } = useTranslation();
  const { isMobile } = useScreen();

  if (languages.length <= 1) {
    return null;
  }

  const trigger = (
    <LanguageIcon
      className={cn(
        "oui-size-6 lg:oui-size-5",
        "oui-cursor-pointer oui-text-base-contrast-80",
        "oui-transition-colors hover:oui-fill-base-contrast",
        isMobile && "oui-size-[18px]"
      )}
      id="language-switcher-icon"
      onClick={() => props.onOpenChange(true)}
    />
  );

  const header = (
    <Text weight="semibold">{t("languageSwitcher.language")}</Text>
  );

  const languageList = languages.map(item => {
    const selected = props.selectedLang === item.localCode;
    return (
      <LanguageItem
        className={cn(
          "oui-w-[calc((100%_-_4px)/2)] lg:oui-w-[calc((100%_-_8px)/3)]"
        )}
        key={item.localCode}
        selected={selected}
        item={item}
        onClick={() => props.onLangChange(item.localCode, item.displayName)}
        loading={props.loading}
      />
    );
  });

  const context = (
    <Flex gap={1} className="oui-flex-wrap">
      {languageList}
    </Flex>
  );

  const footer = (
    <Box mt={4}>
      <Text
        size="2xs"
        intensity={54}
        weight="regular"
        className="oui-text-warning-darken"
      >
        {t("languageSwitcher.tips")}
      </Text>
    </Box>
  );

  if (isMobile) {
    return (
      <>
        {trigger}
        <SimpleSheet
          open={props.open}
          onOpenChange={props.onOpenChange}
          classNames={{
            content: cn("oui-px-5 oui-pb-5"),
            body: "oui-pb-[env(safe-area-inset-bottom)]",
          }}
          title={header}
        >
          {context}
          {footer}
        </SimpleSheet>
      </>
    );
  }

  return (
    <>
      {trigger}
      <SimpleDialog
        title={header}
        open={props.open}
        onOpenChange={props.onOpenChange}
        size={isMobile ? "sm" : "xl"}
      >
        {context}
        {footer}
      </SimpleDialog>
    </>
  );
};

type LanguageItemProps = {
  selected: boolean;
  item: Language;
  onClick?: () => void;
  loading?: boolean;
  className?: string;
};

const LanguageItem: FC<LanguageItemProps> = props => {
  const { item } = props;

  const renderTrailing = () => {
    if (props.loading && props.selected) {
      return <Spinner size="sm" />;
    }
    if (props.selected) {
      return <Box gradient="brand" r="full" width={4} height={4} />;
    }
    return null;
  };

  return (
    <button
      className={cn(
        "oui-group oui-rounded-md hover:oui-bg-base-5",
        props.selected && "oui-bg-base-5",
        props.className
      )}
      onClick={props.onClick}
    >
      <Flex justify="between" className="oui-h-10" px={3}>
        <Flex itemAlign="center" width="100%" className="oui-gap-x-[6px]">
          <Text
            size="2xs"
            className={cn(
              "oui-text-base-contrast-36 group-hover:oui-text-base-contrast-80",
              props.selected && "oui-text-base-contrast-80"
            )}
          >
            {item.displayName}
          </Text>
        </Flex>
        {renderTrailing()}
      </Flex>
    </button>
  );
};

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

const LanguageIcon = forwardRef<SVGSVGElement, IconProps>((props, ref) => {
  const { size = 20, ...rest } = props;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      ref={ref}
      {...rest}
    >
      <path d="M10 1.678a8.333 8.333 0 1 0 0 16.667 8.333 8.333 0 1 0 0-16.667m0 1.667c1.1 0 2.308 2.527 2.492 5.831l-4.975.01c.183-3.304 1.382-5.84 2.482-5.84m-2.943.67c-.717 1.393-1.1 3.242-1.193 5.165L3.38 9.174c.248-2.271 1.778-4.176 3.676-5.159m5.889.003c1.898.983 3.388 2.835 3.676 5.168l-2.483-.008c-.078-2-.52-3.758-1.193-5.16m-9.56 6.83 2.483-.02c.092 1.923.478 3.803 1.191 5.182a6.79 6.79 0 0 1-3.674-5.162m4.118.007 4.975-.01c-.184 3.303-1.38 5.833-2.48 5.833s-2.312-2.519-2.495-5.823m6.64-.008 2.471-.008c-.287 2.208-1.68 4.18-3.672 5.162.74-1.53 1.108-3.23 1.2-5.154" />
    </svg>
  );
});
