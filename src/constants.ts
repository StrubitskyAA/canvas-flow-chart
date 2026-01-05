import { canvasConfigType } from "./typescript";

export const defaultCanvasConfig: canvasConfigType = {
  images: [],
  tools: [],
};

export const editPointRadius = 14;
export const editPointColor = "#1976d2";
export const activePointColor = "#2e7d32";
export const transparentColor = "transparent";

export enum toolTypesEnum {
  line = "line",
  rect = "rect",
  circle = "circle",
}

export const minToolLength = 20;
