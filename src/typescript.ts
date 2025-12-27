import { Dispatch, SetStateAction } from "react";

export type editPointType = [canvasCoordsType, Path2D[]];
export type canvasCoordsType = [number, number, number, number];
export type pointCoordsType = [number, number];

export type canvasConfigType = {
  images: {
    img: string | File;
    coords: null | canvasCoordsType;
  }[];
};

export type canvasHelpersType = {
  imgs: HTMLImageElement[];
  isEditing: boolean;
  height: number;
  width: number;
  ctx: CanvasRenderingContext2D | null;
  points: editPointType[];
  selectedPointIndex: number | null;
  selectedRectIndex: number | null;
  canvasDrow: (args: {
    canvas: HTMLCanvasElement;
    config: canvasConfigType;
    isEditMode: boolean;
    isImageEditMode: boolean;
    canvasHeight: number;
    canvasWidth: number;
    setConfig: Dispatch<SetStateAction<canvasConfigType>>;
  }) => void;
  drawImage: (args: {
    img: HTMLImageElement;
    isImageEditMode: boolean;
    coords: canvasCoordsType | null;
  }) => editPointType;
  editImages: (args: {
    canvas: HTMLCanvasElement;
    setConfig: Dispatch<SetStateAction<canvasConfigType>>;
  }) => (e: MouseEvent) => void;
  calculateCoords: (newImg: HTMLImageElement) => canvasCoordsType;
  getPointCoords: (coords: canvasCoordsType, index: number) => [number, number];
  drawEditRects: (rect: Path2D, coords: pointCoordsType) => void;
  redrawImages: (args: {
    isImageEditMode: boolean;
    deltaCoords: pointCoordsType;
  }) => void;
  changeEditableCoords: (args: {
    coords: canvasCoordsType;
    changeCoords: pointCoordsType;
  }) => canvasCoordsType;
  recalcDeltaCoords: (args: {
    coords: canvasCoordsType;
    changeCoords: pointCoordsType;
  }) => [number, number];
  prepareEditableCoords: (args: {
    coords: canvasCoordsType;
    mouseCoords: pointCoordsType;
  }) => canvasCoordsType;
  resetState: (canvas: HTMLCanvasElement) => void;
  isPointInRectCheck: (args: {
    coords: canvasCoordsType;
    i: number;
    x: number;
    y: number;
  }) => boolean;
};
