import { SVGProps } from "react";

export const PointSystemIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width={40}
    height={40}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M0 20C0 8.954 8.954 0 20 0s20 8.954 20 20-8.954 20-20 20S0 31.046 0 20"
      fill="#f0b100"
      fillOpacity={0.2}
    />
    <g
      clipPath="url(#a)"
      stroke="#fdc700"
      strokeWidth={1.667}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18.334 22.217v1.355a1.67 1.67 0 0 1-.814 1.413 4.17 4.17 0 0 0-1.686 3.33m5.833-6.098v1.355a1.67 1.67 0 0 0 .813 1.413 4.17 4.17 0 0 1 1.686 3.33M25 17.5h1.25a2.083 2.083 0 0 0 0-4.167H25m-11.666 15h13.333" />
      <path d="M15 17.5a5 5 0 0 0 10 0v-5a.833.833 0 0 0-.833-.833h-8.334A.833.833 0 0 0 15 12.5zm0 0h-1.25a2.083 2.083 0 0 1 0-4.167H15" />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M10 10h20v20H10z" />
      </clipPath>
    </defs>
  </svg>
);
