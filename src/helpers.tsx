import _ from "lodash";
import { Dispatch, SetStateAction } from "react";

import {
  canvasConfigType,
  canvasCoordsType,
  editPointType,
  pointCoordsType,
  toolType,
} from "./typescript";
import { itemDataType } from "./tree";

import {
  activePointColor,
  editPointColor,
  editPointRadius,
  minToolLength,
  toolTypesEnum,
} from "./constants";

import {
  calculateCoords,
  getPointCoords,
  getToolLength,
  isPointInRectCheck,
  changeEditableCoords,
  changeToolsCoords,
  drawLine,
  drawRect,
  drawEllipse,
  getToolInitialCoords,
  drawSwitch,
} from "./calculate-helpers";

export const getAllItemIds = (data: itemDataType[], res?: string[]) => {
  const result: string[] = res || [];
  data.forEach((item) => {
    result.push(item.itemId);
    if (item.children?.length) getAllItemIds(item.children, result);
  });

  return result;
};

class Canvas {
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

  constructor() {
    this.imgs = [];
    this.isEditMode = false;
    this.isImageEditMode = false;
    this.isToolsEditMode = false;
    this.isEditing = false;
    this.toolType = null;
    this.height = 0;
    this.width = 0;
    this.ctx = null;
    this.points = [];
    this.tools = [];
    this.canvas = null;
    this.selectedPointIndex = null;
    this.selectedToolIndex = null;
    this.selectedRectIndex = null;
  }

  setConfiguration({
    isEditMode,
    isImageEditMode,
    isToolsEditMode,
    toolType,
    config,
    setConfig,
  }: {
    isEditMode: boolean;
    isToolsEditMode: boolean;
    isImageEditMode: boolean;
    toolType: toolTypesEnum | null;
    config: canvasConfigType;
    setConfig: Dispatch<SetStateAction<canvasConfigType>>;
  }) {
    this.isEditMode = isEditMode;
    this.isImageEditMode = isImageEditMode;
    this.isToolsEditMode = isToolsEditMode;
    this.toolType = toolType;
    this.update({ config, setConfig });
    if (this.canvas && this.isEditMode && !this.isEditing) {
      this.canvas.onmousemove = this.editCanvas({ setConfig });
    }
  }
  initialization({
    canvas,
    config,
    setConfig,
    canvasHeight,
    canvasWidth,
    setEditableToolIndex,
  }: {
    canvas: HTMLCanvasElement;
    config: canvasConfigType;
    setConfig: Dispatch<SetStateAction<canvasConfigType>>;
    canvasHeight: number;
    canvasWidth: number;
    setEditableToolIndex: Dispatch<SetStateAction<number | null>>;
  }) {
    this.height = canvasHeight;
    this.width = canvasWidth;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.width, this.height);
      if (!this.isImageEditMode && !this.isToolsEditMode) {
        this.resetState();
        this.selectedPointIndex = null;
        this.selectedToolIndex = null;
        this.selectedRectIndex = null;
      }
      if (config && config.images.length) {
        if (this.imgs.length) {
          this.imgs.forEach((element) => element.remove());
          this.imgs = [];
          this.points = [];
        }
        Promise.all(
          config.images.map(
            (imgConf, i) =>
              new Promise((resolve) => {
                const newImg = document.createElement("img");
                document.body.appendChild(newImg);
                newImg.setAttribute(
                  "src",
                  _.isString(imgConf.img)
                    ? `/file/download/${imgConf.img}`
                    : URL.createObjectURL(imgConf.img as File)
                );
                newImg.setAttribute("class", "hidden back");
                this.imgs.push(newImg);
                newImg.onload = (e) => resolve(newImg);
              })
          )
        ).then((imgs) => {
          imgs.forEach((newImg, i) => {
            const point = this.drawImage({
              img: newImg as HTMLImageElement,
              coords: config.images[i].coords,
              isActive: this.selectedPointIndex === i,
            });

            this.points.push(point);
          });

          this.updateTools(config, setConfig);
        });
      } else {
        this.updateTools(config, setConfig);
      }
      canvas.oncontextmenu = (e) => {
        e.preventDefault();
        if (
          this.isToolsEditMode &&
          !this.toolType &&
          _.isNumber(this.selectedToolIndex)
        ) {
          const index = this.selectedToolIndex;
          setEditableToolIndex(index);
        }
      };
    }
  }
  editCanvas(args: { setConfig: Dispatch<SetStateAction<canvasConfigType>> }) {
    return (e: MouseEvent) => {
      this.editImages(args)(e);
      this.editTools(args)(e);
    };
  }
  updateTools(
    config: canvasConfigType,
    setConfig: Dispatch<SetStateAction<canvasConfigType>>
  ) {
    if (config && config.tools.length) {
      this.tools = config.tools;
      this.tools.forEach((tool, i) => {
        this.drawTool({
          tool,
          isActive: !this.toolType && this.selectedToolIndex === i,
        });
      });
      if (this.isEditMode && !this.isEditing) {
        (this.canvas as HTMLCanvasElement).onmousemove = this.editTools({
          setConfig,
        });
      }
    }
  }
  update({
    config,
    setConfig,
  }: {
    config: canvasConfigType;
    setConfig: Dispatch<SetStateAction<canvasConfigType>>;
  }) {
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.width, this.height);
      if (!this.isImageEditMode) {
        this.selectedPointIndex = null;
      }
      if (!this.isToolsEditMode) {
        this.selectedToolIndex = null;
      }
      if (!this.isToolsEditMode && !this.isImageEditMode) {
        this.resetState();
        this.selectedRectIndex = null;
      }
      if (config && config.images.length) {
        if (this.imgs.length) {
          this.points = [];
        }
        this.imgs.forEach((newImg, i) => {
          const point = this.drawImage({
            img: newImg as HTMLImageElement,
            coords: config.images[i].coords,
            isActive: this.selectedPointIndex === i,
          });

          this.points.push(point);
        });
        if (this.isEditMode && !this.isEditing) {
          (this.canvas as HTMLCanvasElement).onmousemove = this.editImages({
            setConfig,
          });
        }
      }
      this.updateTools(config, setConfig);
    }
  }
  drawImage({
    img,
    coords,
    isActive,
  }: {
    img: HTMLImageElement;
    coords: canvasCoordsType | null;
    isActive: boolean;
  }): editPointType {
    const imgCoords = coords || calculateCoords(img, this.width, this.height);

    (this.ctx as CanvasRenderingContext2D).drawImage(img, ...imgCoords);
    if (this.isImageEditMode && this.ctx) {
      const editRects = [
        new Path2D(),
        new Path2D(),
        new Path2D(),
        new Path2D(),
      ];

      (this.ctx as CanvasRenderingContext2D).fillStyle = isActive
        ? activePointColor
        : editPointColor;

      editRects.forEach((rect, index) => {
        const pointCoords = getPointCoords(imgCoords, index);

        this.drawEditRects(rect, pointCoords);
      });

      return [imgCoords, editRects];
    }

    return [imgCoords, []];
  }
  editTools({
    setConfig,
  }: {
    setConfig: Dispatch<SetStateAction<canvasConfigType>>;
  }) {
    return (event: MouseEvent) => {
      if (this.isToolsEditMode && this.canvas) {
        if (!!this.toolType) {
          this.canvas.onmousedown = (ev: MouseEvent) => {
            this.isEditing = true;
            if (this.toolType) {
              this.selectedToolIndex = this.tools.length;
            }
            (this.canvas as HTMLCanvasElement).onmousemove = (
              e: MouseEvent
            ) => {
              this.updateCanvas({
                deltaCoords: [e.movementX, e.movementY],
                startCoords: [ev.offsetX, ev.offsetY],
                endCoords: [e.offsetX, e.offsetY],
              });
            };
            window.onmouseup = (e: MouseEvent) => {
              const tools = _.clone(this.tools);
              const index = this.selectedToolIndex as number;
              const length = getToolLength(tools[index]);
              if (length < minToolLength) {
                this.tools = tools.filter((tool, i) => index !== i);
                this.updateCanvas({
                  deltaCoords: [0, 0],
                });
              }
              setConfig((config) => ({
                ...config,
                tools:
                  length < minToolLength
                    ? tools.filter((tool, i) => index !== i)
                    : tools,
              }));
              this.selectedToolIndex = null;
              this.resetState();
            };
          };
        } else {
          for (let i = this.tools.length - 1; i > -1; i--) {
            const tool = this.tools[i];
            const path = tool.path;
            const isSelectedTool =
              path &&
              (!!this.ctx?.isPointInPath(path, event.offsetX, event.offsetY) ||
                !!this.ctx?.isPointInStroke(
                  path,
                  event.offsetX,
                  event.offsetY
                ));
            if (isSelectedTool) {
              if (this.selectedToolIndex !== i) {
                this.selectedToolIndex = i;
                this.updateCanvas({
                  deltaCoords: [0, 0],
                  startCoords: [tool.coords[0], tool.coords[1]],
                  endCoords: [tool.coords[2], tool.coords[3]],
                });
              }
              break;
            } else {
              if (this.selectedToolIndex !== null) {
                this.selectedToolIndex = null;
                this.updateCanvas({
                  deltaCoords: [0, 0],
                  startCoords: [tool.coords[0], tool.coords[1]],
                  endCoords: [tool.coords[2], tool.coords[3]],
                });
              }
            }
          }
          if (this.selectedToolIndex !== null) {
            this.canvas.onmousedown = (ev: MouseEvent) => {
              this.isEditing = true;
              (this.canvas as HTMLCanvasElement).onmousemove = (
                e: MouseEvent
              ) => {
                this.updateCanvas({
                  deltaCoords: [e.movementX, e.movementY],
                });
              };
              window.onmouseup = (e: MouseEvent) => {
                const tools = _.clone(this.tools);
                setConfig((config) => ({
                  ...config,
                  tools,
                }));
                this.resetState();
              };
            };
            window.onkeyup = (e: KeyboardEvent) => {
              if (e.key === "Delete") {
                const toolIndex = _.clone(this.selectedToolIndex) as number;
                this.tools = this.tools.filter((tool, i) => i !== toolIndex);

                setConfig((config) => {
                  return {
                    ...config,
                    tools: this.tools,
                  };
                });
                this.resetState();
                this.selectedToolIndex = null;
              }
            };
          }
        }
      }
    };
  }
  editImages({
    setConfig,
  }: {
    setConfig: Dispatch<SetStateAction<canvasConfigType>>;
  }) {
    return (e: MouseEvent) => {
      if (this.isImageEditMode) {
        for (let i = this.points.length - 1; i > -1; i--) {
          this.points[i][1].some((rect, index) => {
            const isPointInPath = !!this.ctx?.isPointInPath(
              rect,
              e.offsetX,
              e.offsetY
            );
            if (isPointInPath) {
              this.selectedRectIndex = index;
            } else {
              this.selectedRectIndex = null;
            }

            return isPointInPath;
          });
          if (
            isPointInRectCheck({
              coords: this.points[i][0],
              x: e.offsetX,
              y: e.offsetY,
            })
          ) {
            if (this.selectedPointIndex !== i) {
              this.selectedPointIndex = i;
              this.updateCanvas({ deltaCoords: [0, 0] });
            }
            break;
          } else {
            if (this.selectedPointIndex !== null) {
              this.selectedPointIndex = null;
              this.updateCanvas({ deltaCoords: [0, 0] });
            }
          }
        }
        if (_.isNumber(this.selectedPointIndex)) {
          const canvas = this.canvas as HTMLCanvasElement;
          canvas.onmousedown = (e: MouseEvent) => {
            this.isEditing = true;
            canvas.onmousemove = (e: MouseEvent) => {
              this.updateCanvas({
                deltaCoords: [e.movementX, e.movementY],
              });
            };
            window.onmouseup = (e: MouseEvent) => {
              const pointIndex = _.clone(this.selectedPointIndex);
              setConfig((config) => ({
                ...config,
                images: config.images.map((image, index) => ({
                  ...image,
                  coords:
                    index === pointIndex
                      ? this.points[index][0]
                      : image.coords || this.points[index][0],
                })),
              }));
              this.resetState();
            };
          };
          window.onkeyup = (e: KeyboardEvent) => {
            if (e.key === "Delete") {
              const pointIndex = _.clone(this.selectedPointIndex) as number;
              this.imgs[pointIndex].remove();
              this.imgs = this.imgs.filter((img, i) => i !== pointIndex);

              setConfig((config) => {
                return {
                  ...config,
                  images: config.images.filter(
                    (image, index) => index !== pointIndex
                  ),
                };
              });
              this.resetState();
              this.selectedPointIndex = null;
              this.selectedRectIndex = null;
            }
          };
        } else {
          this.resetState();
          this.selectedRectIndex = null;
          (this.canvas as HTMLCanvasElement).onmousemove = this.editImages({
            setConfig,
          });
        }
      }
    };
  }
  updateCanvas({
    deltaCoords,
    startCoords,
    endCoords,
  }: {
    deltaCoords: pointCoordsType;
    startCoords?: pointCoordsType;
    endCoords?: pointCoordsType;
  }) {
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.redrawImages({ deltaCoords });
      this.redrawTools({ deltaCoords, startCoords, endCoords });
    }
  }
  redrawTools({
    deltaCoords,
    startCoords,
    endCoords,
  }: {
    deltaCoords: pointCoordsType;
    startCoords?: pointCoordsType;
    endCoords?: pointCoordsType;
  }) {
    if ((this.selectedToolIndex as number) === this.tools.length) {
      this.tools.push({
        type: this.toolType as toolTypesEnum,
        coords: getToolInitialCoords({
          startCoords,
          toolType: this.toolType as toolTypesEnum,
        }),
      });
    }
    this.tools.forEach((tool, index) => {
      if (this.selectedToolIndex === index) {
        tool.coords = changeToolsCoords({
          coords: tool.coords,
          changeCoords: deltaCoords,
          startCoords,
          endCoords,
          type: tool.type,
          toolType: this.toolType,
        });
      }
      this.drawTool({
        tool,
        isActive: !this.toolType && this.selectedToolIndex === index,
      });
    });
  }
  drawTool(args: { tool: toolType; isActive: boolean }) {
    if (this.ctx) {
      this.ctx.beginPath();
      switch (args.tool.type) {
        case toolTypesEnum.line: {
          args.tool.path = drawLine({
            ...args,
            ctx: this.ctx as CanvasRenderingContext2D,
          });
          break;
        }
        case toolTypesEnum.switch: {
          args.tool.path = drawSwitch({
            ...args,
            ctx: this.ctx as CanvasRenderingContext2D,
          });
          break;
        }
        case toolTypesEnum.rect: {
          args.tool.path = drawRect({
            ...args,
            ctx: this.ctx as CanvasRenderingContext2D,
          });
          break;
        }
        case toolTypesEnum.circle: {
          args.tool.path = drawEllipse({
            ...args,
            ctx: this.ctx as CanvasRenderingContext2D,
          });
          break;
        }
      }
    }
  }
  redrawImages({ deltaCoords }: { deltaCoords: pointCoordsType }) {
    this.imgs.forEach((img, index) => {
      if (this.selectedPointIndex === index) {
        this.points[index][0] = changeEditableCoords({
          coords: this.points[index][0],
          changeCoords: deltaCoords,
          selectedRectIndex: this.selectedRectIndex,
          width: this.width,
          height: this.height,
        });
      }
      this.drawImage({
        img,
        coords: this.points[index][0],
        isActive: this.selectedPointIndex === index,
      });
    });
  }
  drawEditRects(rect: Path2D, coords: pointCoordsType) {
    rect.rect(...coords, editPointRadius, editPointRadius);
    (this.ctx as CanvasRenderingContext2D).fill(rect);
  }
  resetState() {
    this.isEditing = false;
    if (this.canvas) {
      this.canvas.onmousemove = null;
      this.canvas.onmousedown = null;
      window.onmouseup = null;
    }
    window.onkeyup = null;
  }
}

export const CanvasHelpers = new Canvas();
