import { FC } from "react";

import { editPointRadius, initialColor } from "../constants";

const SwitchSvg: FC<{
  size?: number;
  color?: string;
  strokeWidth?: number;
  isOpen?: boolean;
}> = ({
  size = 24,
  color = initialColor,
  strokeWidth = editPointRadius / 2,
  isOpen = true,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
  >
    <g transform="scale(1)">
      <defs></defs>
      <g transform="translate(55.79,-100.42) scale(0.421053)">
        <path
          fill="none"
          stroke={color}
          d=" M -128 264 L -120 264"
          strokeLinecap="round"
          strokeWidth={strokeWidth * 1.4}
        ></path>
        <path
          fill="none"
          stroke={color}
          d=" M -88 264 L -80 264"
          strokeLinecap="round"
          strokeWidth={strokeWidth * 1.4}
        ></path>
        {isOpen ? (
          <path
            fill="none"
            stroke={color}
            d=" M -120 264 L -88 250"
            strokeLinecap="round"
            strokeWidth={strokeWidth * 1.4}
          ></path>
        ) : (
          <path
            fill="none"
            stroke={color}
            d=" M -121 257 L -86 257"
            strokeLinecap="round"
            strokeWidth={strokeWidth * 1.4}
          ></path>
        )}
      </g>
      &lt;<g></g>
    </g>
  </svg>
);

export default SwitchSvg;
