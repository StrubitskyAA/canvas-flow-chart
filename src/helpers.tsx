import _ from "lodash";

import { canvasCoordsType, canvasHelpersType } from "./typescript";
import { itemDataType } from "./tree";

import {
  activePointColor,
  editPointColor,
  editPointRadius,
  minToolLength,
  toolTypesEnum,
} from "./constants";

import { getToolLength } from "./calculate-helpers";

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
    const imgCoords = coords || this.calculateCoords(img);

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
        const pointCoords = this.getPointCoords(imgCoords, index);

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
            this.isPointInRectCheck({
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
        tool.coords = this.changeToolsCoords({
          coords: tool.coords,
          changeCoords: deltaCoords,
          startCoords,
          endCoords,
          type: tool.type,
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
        this.points[index][0] = this.changeEditableCoords({
          coords: this.points[index][0],
          changeCoords: deltaCoords,
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
  calculateCoords: function (img) {
    const [imgWidth, imgHeight] = [img.offsetWidth, img.offsetHeight];

    return imgWidth / imgHeight > this.width / this.height
      ? [0, 0, this.width, Math.floor((imgHeight / imgWidth) * this.width)]
      : [0, 0, Math.floor((imgWidth / imgHeight) * this.height), this.height];
  },
  changeToolsCoords: function ({
    coords,
    changeCoords,
    startCoords,
    endCoords,
    type,
  }) {
    switch (type || this.toolType) {
      case toolTypesEnum.line:
        return [
          ...(this.toolType
            ? startCoords || [coords[0], coords[1]]
            : [coords[0] + changeCoords[0], coords[1] + changeCoords[1]]),
          ...(this.toolType
            ? endCoords || [
                coords[2] + changeCoords[0],
                coords[3] + changeCoords[1],
              ]
            : [coords[2] + changeCoords[0], coords[3] + changeCoords[1]]),
        ] as canvasCoordsType;
      default:
        return [0, 0, 0, 0];
    }
  },
  changeEditableCoords: function ({ coords, changeCoords }) {
    return this.prepareEditableCoords({
      coords,
      mouseCoords: this.recalcDeltaCoords({ coords, changeCoords }),
    });
  },
  recalcDeltaCoords: function ({ coords, changeCoords }) {
    switch (this.selectedRectIndex) {
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
  },
  calculateBorderedCoords: function ({
    start,
    length,
    delta,
    limitMin,
    limitMax,
  }) {
    return start + delta < limitMin
      ? limitMin
      : start + delta + length > limitMax
      ? limitMax - length
      : start + delta;
  },
  prepareEditableCoords: function ({ coords, mouseCoords }) {
    switch (this.selectedRectIndex) {
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
          this.calculateBorderedCoords({
            start: coords[0],
            length: coords[2],
            delta: mouseCoords[0],
            limitMax: this.width,
            limitMin: 0,
          }),
          this.calculateBorderedCoords({
            start: coords[1],
            length: coords[3],
            delta: mouseCoords[1],
            limitMax: this.height,
            limitMin: 0,
          }),
          coords[2],
          coords[3],
        ];
    }
  },
  getPointCoords: function (coords, index) {
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
  },
  isPointInRectCheck: function ({ coords, x, y }) {
    return (
      x > coords[0] &&
      x < coords[0] + coords[2] &&
      y > coords[1] &&
      y < coords[1] + coords[3]
    );
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
