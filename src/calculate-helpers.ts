import { canvasCoordsType, toolType } from "./typescript";

import { toolTypesEnum } from "./constants";

const calcLineLength = (coords: canvasCoordsType) =>
  Math.sqrt(
    Math.pow(coords[0] - coords[2], 2) + Math.pow(coords[1] - coords[3], 2)
  );
const calcRectLength = (coords: canvasCoordsType) =>
  Math.sqrt(Math.pow(coords[2], 2) + Math.pow(coords[3], 2));

export const getToolLength = (tool: toolType) => {
  if (!tool) return 0;
  switch (tool.type) {
    case toolTypesEnum.line: {
      return calcLineLength(tool.coords);
    }
    default:
      return calcRectLength(tool.coords);
  }
};
