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
  round?: string | number[];
  path?: Path2D;
};

export type canvasHelpersType = {
  imgs: HTMLImageElement[];
  isEditing: boolean;
  isEditMode: boolean;
  isImageEditMode: boolean;
  isToolsEditMode: boolean;
  toolType: toolTypesEnum | null;
  height: number;
  width: number;
  canvas: HTMLCanvasElement | null;
  ctx: CanvasRenderingContext2D | null;
  points: editPointType[];
  tools: toolType[];
  selectedPointIndex: number | null;
  selectedToolIndex: number | null;
  selectedRectIndex: number | null;
  setEditingMode: (atgs: {
    isEditMode: boolean;
    isToolsEditMode: boolean;
    isImageEditMode: boolean;
    toolType: toolTypesEnum | null;
    config: canvasConfigType;
    setConfig: Dispatch<SetStateAction<canvasConfigType>>;
  }) => void;
  canvasDrow: (args: {
    canvas: HTMLCanvasElement;
    config: canvasConfigType;
    setConfig: Dispatch<SetStateAction<canvasConfigType>>;
    canvasHeight: number;
    canvasWidth: number;
  }) => void;
  canvasRedraw: (args: {
    config: canvasConfigType;
    setConfig: Dispatch<SetStateAction<canvasConfigType>>;
  }) => void;
  drawImage: (args: {
    img: HTMLImageElement;
    coords: canvasCoordsType | null;
    isActive: boolean;
  }) => editPointType;
  editCanvas: (args: {
    setConfig: Dispatch<SetStateAction<canvasConfigType>>;
  }) => (e: MouseEvent) => void;
  editImages: (args: {
    setConfig: Dispatch<SetStateAction<canvasConfigType>>;
  }) => (e: MouseEvent) => void;
  editTools: (args: {
    setConfig: Dispatch<SetStateAction<canvasConfigType>>;
  }) => (e: MouseEvent) => void;
  calculateCoords: (newImg: HTMLImageElement) => canvasCoordsType;
  getPointCoords: (coords: canvasCoordsType, index: number) => [number, number];
  drawEditRects: (rect: Path2D, coords: pointCoordsType) => void;
  redrawImages: (args: { deltaCoords: pointCoordsType }) => void;
  canvasRedrawTools: (
    config: canvasConfigType,
    setConfig: Dispatch<SetStateAction<canvasConfigType>>
  ) => void;
  redrawTools: (args: {
    deltaCoords: pointCoordsType;
    startCoords?: pointCoordsType;
    endCoords?: pointCoordsType;
  }) => void;
  updateCanvas: (args: {
    deltaCoords: pointCoordsType;
    startCoords?: pointCoordsType;
    endCoords?: pointCoordsType;
  }) => void;
  changeEditableCoords: (args: {
    coords: canvasCoordsType;
    changeCoords: pointCoordsType;
  }) => canvasCoordsType;
  changeToolsCoords: (args: {
    coords: canvasCoordsType;
    changeCoords: pointCoordsType;
    startCoords?: pointCoordsType;
    endCoords?: pointCoordsType;
    type?: toolTypesEnum;
  }) => canvasCoordsType;
  drawTool: (args: { tool: toolType; isActive: boolean }) => void;
  drawLine: (args: { tool: toolType; isActive: boolean }) => Path2D;
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
