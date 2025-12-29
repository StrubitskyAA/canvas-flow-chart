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
  isEditMode: boolean;
  isImageEditMode: boolean;
  height: number;
  width: number;
  canvas: HTMLCanvasElement | null;
  ctx: CanvasRenderingContext2D | null;
  points: editPointType[];
  selectedPointIndex: number | null;
  selectedRectIndex: number | null;
  setEditingMode: (atgs: {
    isEditMode: boolean;
    isImageEditMode: boolean;
    config: canvasConfigType;
    setConfig: Dispatch<SetStateAction<canvasConfigType>>;
  }) => void;
  canvasDrow: (args: {
    canvas: HTMLCanvasElement;
    config: canvasConfigType;
    canvasHeight: number;
    canvasWidth: number;
    setConfig: Dispatch<SetStateAction<canvasConfigType>>;
  }) => void;
  canvasRedrow: (args: {
    config: canvasConfigType;
    setConfig: Dispatch<SetStateAction<canvasConfigType>>;
  }) => void;
  drawImage: (args: {
    img: HTMLImageElement;
    coords: canvasCoordsType | null;
    isActive: boolean;
  }) => editPointType;
  editImages: (args: {
    setConfig: Dispatch<SetStateAction<canvasConfigType>>;
  }) => (e: MouseEvent) => void;
  calculateCoords: (newImg: HTMLImageElement) => canvasCoordsType;
  getPointCoords: (coords: canvasCoordsType, index: number) => [number, number];
  drawEditRects: (rect: Path2D, coords: pointCoordsType) => void;
  redrawImages: (args: { deltaCoords: pointCoordsType }) => void;
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
  resetState: () => void;
  isPointInRectCheck: (args: {
    coords: canvasCoordsType;
    x: number;
    y: number;
  }) => boolean;
  calculateBorderedCoords: (args: {
    start: number;
    length: number;
    delta: number;
    limitMin: number;
    limitMax: number;
  }) => number;
};
