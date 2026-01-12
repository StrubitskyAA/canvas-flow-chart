import { renderToString } from "react-dom/server";

import {
  activeColor,
  initialColor,
  minToolLength,
  toolTypesEnum,
} from "../constants";

import SwitchSvg from "./switch-svg";

const GetStringSvg = ({
  isActive,
  isOpen,
  stroke,
  type,
  strokeWidth,
}: {
  isActive: boolean;
  isOpen?: boolean;
  stroke?: string;
  strokeWidth?: number;
  type: toolTypesEnum;
}) => {
  switch (type) {
    case toolTypesEnum.switch:
      return renderToString(
        <SwitchSvg
          isOpen={isOpen}
          size={minToolLength + 4}
          color={isActive ? activeColor : stroke || initialColor}
          strokeWidth={strokeWidth}
        />
      );
    default:
      return "";
  }
};

export default GetStringSvg;
