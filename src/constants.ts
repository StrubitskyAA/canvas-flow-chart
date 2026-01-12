import { canvasConfigType, toolType } from "./typescript";

export const defaultCanvasConfig: canvasConfigType = {
  images: [],
  tools: [],
};

export const editPointRadius = 14;
export const editErrorColor = "#d32f2f";
export const editPointColor = "#1976d2";
export const activePointColor = "#2e7d32";
export const transparentColor = "transparent";
export const initialColor = "#000000";
export const activeColor = "cyan";

export enum toolTypesEnum {
  line = "line",
  rect = "rect",
  circle = "circle",
  switch = "switch",
}

export const minToolLength = 40;

export const initialToolTypeValue: toolType = {
  coords: [0, 0, 0, 0],
  type: toolTypesEnum.line,
};
