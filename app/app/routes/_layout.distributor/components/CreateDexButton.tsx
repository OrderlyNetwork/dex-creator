import { useNavigate } from "@remix-run/react";
import { Button } from "../../../components/Button";
import { useTranslation } from "~/i18n";

export const CreateDexButton = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleCreate = () => {
    navigate("/dex");
  };

  return (
    <Button variant="primary" size="md" onClick={handleCreate}>
      <span>{t("distributor.createDex")}</span>
      <ArrowRightIcon />
    </Button>
  );
};

export const ArrowRightIcon = () => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <mask
        id="a"
        style={{ maskType: "alpha" }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="20"
        height="20"
      >
        <path fill="#d9d9d9" d="M0 0h20v20H0z" />
      </mask>
      <g mask="url(#a)">
        <path
          d="M13.502 10.542H4.417V9.458h9.085L9.234 5.19 10 4.416 15.583 10 10 15.583l-.766-.774z"
          fill="#fff"
          fill-opacity=".98"
        />
      </g>
    </svg>
  );
};
