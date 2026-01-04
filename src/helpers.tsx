import _ from "lodash";

import { canvasHelpersType } from "./typescript";
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
} from "./calculate-helpers";

export const getAllItemIds = (data: itemDataType[], res?: string[]) => {
  const result: string[] = res || [];
  data.forEach((item) => {
    result.push(item.itemId);
    if (item.children?.length) getAllItemIds(item.children, result);
  });

  return result;
};

export const canvasHelpers: canvasHelpersType = {
  imgs: [],
  isEditMode: false,
  isImageEditMode: false,
  isToolsEditMode: false,
  isEditing: false,
  toolType: null,
  height: 0,
  width: 0,
  ctx: null,
  points: [],
  tools: [],
  canvas: null,
  selectedPointIndex: null,
  selectedToolIndex: null,
  selectedRectIndex: null,
  setEditingMode: function ({
    isEditMode,
    isImageEditMode,
    isToolsEditMode,
    toolType,
    config,
    setConfig,
  }) {
    this.isEditMode = isEditMode;
    this.isImageEditMode = isImageEditMode;
    this.isToolsEditMode = isToolsEditMode;
    this.toolType = toolType;
    this.canvasRedraw({ config, setConfig });
    if (this.canvas && this.isEditMode && !this.isEditing) {
      this.canvas.onmousemove = this.editCanvas({ setConfig });
    }
  },
  canvasDrow: function ({
    canvas,
    config,
    setConfig,
    canvasHeight,
    canvasWidth,
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
                newImg.addEventListener("load", (e) => {
                  resolve(newImg);
                });
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

          this.canvasRedrawTools(config, setConfig);
        });
      } else {
        this.canvasRedrawTools(config, setConfig);
      }
    }
  },
  editCanvas: function (args) {
    return (e) => {
      this.editImages(args)(e);
      this.editTools(args)(e);
    };
  },
  canvasRedrawTools: function (config, setConfig) {
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
  },
  canvasRedraw: function ({ config, setConfig }) {
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
      this.canvasRedrawTools(config, setConfig);
    }
  },
  drawImage: function ({ img, coords, isActive }) {
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
  },
  editTools: function ({ setConfig }) {
    return (event) => {
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
            (this.canvas as HTMLCanvasElement).onmouseup = (e: MouseEvent) => {
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
              (this.canvas as HTMLCanvasElement).onmouseup = (
                e: MouseEvent
              ) => {
                const tools = _.clone(this.tools);
                setConfig((config) => ({
                  ...config,
                  tools,
                }));
                this.selectedToolIndex = null;
                this.resetState();
              };
            };
          }
        }
      }
    };
  },
  editImages: function ({ setConfig }) {
    return (e) => {
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
            canvas.onmouseup = (e: MouseEvent) => {
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
  },
  updateCanvas: function ({ deltaCoords, startCoords, endCoords }) {
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.redrawImages({ deltaCoords });
      this.redrawTools({ deltaCoords, startCoords, endCoords });
    }
  },
  redrawTools: function ({ deltaCoords, startCoords, endCoords }) {
    if ((this.selectedToolIndex as number) === this.tools.length) {
      this.tools.push({
        type: this.toolType as toolTypesEnum,
        coords: [...(startCoords || [0, 0]), ...(startCoords || [0, 0])],
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
  },
  drawTool: function (args) {
    if (this.ctx) {
      this.ctx.beginPath();
      switch (args.tool.type) {
        case toolTypesEnum.line: {
          args.tool.path = this.drawLine(args);
          break;
        }
      }
    }
  },
  drawLine: function ({ tool, isActive }) {
    const ctx = this.ctx as CanvasRenderingContext2D;
    const path = new Path2D();
    path.moveTo(tool.coords[0], tool.coords[1]);
    path.lineTo(tool.coords[2], tool.coords[3]);
    ctx.strokeStyle = isActive ? "cyan" : (tool.stroke as string) || "black";
    ctx.lineWidth = editPointRadius / 2;
    ctx.stroke(path);

    return path;
  },
  redrawImages: function ({ deltaCoords }) {
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
  },
  drawEditRects: function (rect, coords) {
    rect.rect(...coords, editPointRadius, editPointRadius);
    (this.ctx as CanvasRenderingContext2D).fill(rect);
  },
  resetState: function () {
    this.isEditing = false;
    if (this.canvas) {
      this.canvas.onmousemove = null;
      this.canvas.onmousedown = null;
      this.canvas.onmouseup = null;
    }
    window.onkeyup = null;
  },
};
