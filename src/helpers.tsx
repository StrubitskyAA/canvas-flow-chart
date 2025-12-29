import _ from "lodash";

import { canvasHelpersType } from "./typescript";
import { itemDataType } from "./tree";

import { activePointColor, editPointColor, editPointRadius } from "./constants";

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
  isEditing: false,
  height: 0,
  width: 0,
  ctx: null,
  points: [],
  canvas: null,
  selectedPointIndex: null,
  selectedRectIndex: null,
  setEditingMode: function ({
    isEditMode,
    isImageEditMode,
    config,
    setConfig,
  }) {
    this.isEditMode = isEditMode;
    this.isImageEditMode = isImageEditMode;
    this.canvasRedrow({ config, setConfig });
  },
  canvasDrow: function ({
    canvas,
    config,
    canvasHeight,
    canvasWidth,
    setConfig,
  }) {
    this.height = canvasHeight;
    this.width = canvasWidth;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.width, this.height);
      if (!this.isImageEditMode) {
        this.resetState();
        this.selectedPointIndex = null;
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
          if (this.isEditMode && !this.isEditing) {
            canvas.onmousemove = this.editImages({ setConfig });
          }
        });
      }
    }
  },
  canvasRedrow: function ({ config, setConfig }) {
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.width, this.height);
      if (!this.isImageEditMode) {
        this.resetState();
        this.selectedPointIndex = null;
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
              this.redrawImages({ deltaCoords: [0, 0] });
            }
            break;
          } else {
            if (this.selectedPointIndex !== null) {
              this.selectedPointIndex = null;
              this.redrawImages({ deltaCoords: [0, 0] });
            }
          }
        }
        if (_.isNumber(this.selectedPointIndex)) {
          const canvas = this.canvas as HTMLCanvasElement;
          canvas.onmousedown = (e: MouseEvent) => {
            this.isEditing = true;
            canvas.onmousemove = (e: MouseEvent) => {
              this.redrawImages({
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
  redrawImages: function ({ deltaCoords }) {
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.width, this.height);
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
    }
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
