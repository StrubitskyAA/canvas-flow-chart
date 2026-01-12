import { Dispatch, SetStateAction } from "react";

import { toolTypesEnum } from "./constants";

export type editPointType = [canvasCoordsType, Path2D[]];
export type canvasCoordsType = [number, number, number, number];
export type pointCoordsType = [number, number];

export type canvasConfigType = {
  images: {
    img: string | File;
    coords: null | canvasCoordsType;
  }[];
  tools: toolType[];
};
export type toolType = {
  coords: canvasCoordsType;
  type: toolTypesEnum;
  fill?: string | number;
  stroke?: string | number;
  round?: number[];
  path?: Path2D;
  strokeWidth?: number;
  angle?: number;
};
