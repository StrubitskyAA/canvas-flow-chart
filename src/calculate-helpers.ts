import { canvasCoordsType, pointCoordsType, toolType } from "./typescript";

import { editPointRadius, toolTypesEnum } from "./constants";

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

export const getPointCoords = (
  coords: canvasCoordsType,
  index: number
): pointCoordsType => {
  switch (index) {
    case 0:
      return [coords[0], coords[1]];
    case 1:
      return [coords[0] + coords[2] - editPointRadius, coords[1]];
    case 2:
      return [coords[0], coords[1] + coords[3] - editPointRadius];
    case 3:
      return [
        coords[0] + coords[2] - editPointRadius,
        coords[1] + coords[3] - editPointRadius,
      ];
    case 4:
      return [
        (coords[0] + coords[2] - editPointRadius) / 2,
        (coords[1] + coords[3] - editPointRadius) / 2,
      ];
    default:
      return [0, 0];
  }
};

export const calculateCoords = (
  img: HTMLImageElement,
  width: number,
  height: number
): canvasCoordsType => {
  const [imgWidth, imgHeight] = [img.offsetWidth, img.offsetHeight];

  return imgWidth / imgHeight > width / height
    ? [0, 0, width, Math.floor((imgHeight / imgWidth) * width)]
    : [0, 0, Math.floor((imgWidth / imgHeight) * height), height];
};

export const isPointInRectCheck = ({
  coords,
  x,
  y,
}: {
  coords: canvasCoordsType;
  x: number;
  y: number;
}): boolean =>
  !!(
    x > coords[0] &&
    x < coords[0] + coords[2] &&
    y > coords[1] &&
    y < coords[1] + coords[3]
  );

export const calculateBorderedCoords = ({
  start,
  length,
  delta,
  limitMin,
  limitMax,
}: {
  start: number;
  length: number;
  delta: number;
  limitMin: number;
  limitMax: number;
}): number =>
  start + delta < limitMin
    ? limitMin
    : start + delta + length > limitMax
    ? limitMax - length
    : start + delta;

export const prepareEditableCoords = ({
  coords,
  mouseCoords,
  selectedRectIndex,
  width,
  height,
}: {
  coords: canvasCoordsType;
  mouseCoords: pointCoordsType;
  selectedRectIndex: number | null;
  width: number;
  height: number;
}): canvasCoordsType => {
  switch (selectedRectIndex) {
    case 0: {
      return [
        mouseCoords[0],
        mouseCoords[1],
        coords[2] - mouseCoords[0] + coords[0],
        coords[3] - mouseCoords[1] + coords[1],
      ];
    }
    case 1:
      return [
        coords[0],
        mouseCoords[1],
        mouseCoords[0] - coords[0],
        coords[3] - mouseCoords[1] + coords[1],
      ];
    case 2:
      return [
        mouseCoords[0],
        coords[1],
        coords[0] + coords[2] - mouseCoords[0],
        mouseCoords[1] - coords[1],
      ];
    case 3: {
      return [
        coords[0],
        coords[1],
        mouseCoords[0] - coords[0],
        mouseCoords[1] - coords[1],
      ];
    }
    default:
      return [
        calculateBorderedCoords({
          start: coords[0],
          length: coords[2],
          delta: mouseCoords[0],
          limitMax: width,
          limitMin: 0,
        }),
        calculateBorderedCoords({
          start: coords[1],
          length: coords[3],
          delta: mouseCoords[1],
          limitMax: height,
          limitMin: 0,
        }),
        coords[2],
        coords[3],
      ];
  }
};

export const recalcDeltaCoords = ({
  coords,
  changeCoords,
  selectedRectIndex,
}: {
  coords: canvasCoordsType;
  changeCoords: pointCoordsType;
  selectedRectIndex: number | null;
}): pointCoordsType => {
  switch (selectedRectIndex) {
    case 0:
      return [coords[0] + changeCoords[0], coords[1] + changeCoords[1]];
    case 1:
      return [
        coords[0] + coords[2] + changeCoords[0],
        coords[1] + changeCoords[1],
      ];
    case 2:
      return [
        coords[0] + changeCoords[0],
        coords[1] + coords[3] + changeCoords[1],
      ];
    case 3:
      return [
        coords[0] + coords[2] + changeCoords[0],
        coords[1] + coords[3] + changeCoords[1],
      ];
    default:
      return changeCoords;
  }
};

export const changeEditableCoords = ({
  coords,
  changeCoords,
  selectedRectIndex,
  width,
  height,
}: {
  coords: canvasCoordsType;
  changeCoords: pointCoordsType;
  selectedRectIndex: number | null;
  width: number;
  height: number;
}): canvasCoordsType =>
  prepareEditableCoords({
    coords,
    mouseCoords: recalcDeltaCoords({
      coords,
      changeCoords,
      selectedRectIndex,
    }),
    selectedRectIndex,
    width,
    height,
  });

export const changeToolsCoords = ({
  coords,
  changeCoords,
  startCoords,
  endCoords,
  type,
  toolType,
}: {
  coords: canvasCoordsType;
  changeCoords: pointCoordsType;
  startCoords?: pointCoordsType;
  endCoords?: pointCoordsType;
  type?: toolTypesEnum;
  toolType: toolTypesEnum | null;
}): canvasCoordsType => {
  switch (type || toolType) {
    case toolTypesEnum.line:
      return [
        ...(toolType
          ? startCoords || [coords[0], coords[1]]
          : [coords[0] + changeCoords[0], coords[1] + changeCoords[1]]),
        ...(toolType
          ? endCoords || [
              coords[2] + changeCoords[0],
              coords[3] + changeCoords[1],
            ]
          : [coords[2] + changeCoords[0], coords[3] + changeCoords[1]]),
      ] as canvasCoordsType;
    default:
      return [0, 0, 0, 0];
  }
};
