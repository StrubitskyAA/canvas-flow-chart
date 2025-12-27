import _ from "lodash";

import { canvasHelpersType } from "./typescript";
import { itemDataType } from "./tree";

import { editPointColor, editPointRadius } from "./constants";

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
  isEditing: false,
  height: 0,
  width: 0,
  ctx: null,
  points: [],
  selectedPointIndex: null,
  selectedRectIndex: null,
  canvasDrow: function ({
    canvas,
    config,
    isEditMode,
    isImageEditMode,
    canvasHeight,
    canvasWidth,
    setConfig,
  }) {
    this.height = canvasHeight;
    this.width = canvasWidth;
    this.ctx = canvas.getContext("2d");
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.width, this.height);
      if (config && config.images.length) {
        if (this.imgs.length) {
          this.imgs.forEach((element) => element.remove());
          this.imgs = [];
          this.points = [];
        }

        Promise.all(
          config.images.map(
            (imgConf) =>
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
                  const point = this.drawImage({
                    img: newImg,
                    isImageEditMode: isImageEditMode,
                    coords: imgConf.coords,
                  });
                  this.points.push(point);
                  resolve(undefined);
                });
              })
          )
        ).then(() => {
          if (isEditMode && !this.isEditing) {
            canvas.onmousemove = this.editImages({
              canvas,
              setConfig,
            });
          }
        });
      }
    }
  },
  drawImage: function ({ img, isImageEditMode, coords }) {
    const imgCoords = coords || this.calculateCoords(img);

    (this.ctx as CanvasRenderingContext2D).drawImage(img, ...imgCoords);
    if (isImageEditMode) {
      const editRects = [
        new Path2D(),
        new Path2D(),
        new Path2D(),
        new Path2D(),
      ];

      (this.ctx as CanvasRenderingContext2D).fillStyle = editPointColor;

      editRects.forEach((rect, index) => {
        const pointCoords = this.getPointCoords(imgCoords, index);

        this.drawEditRects(rect, pointCoords);
      });

      return [imgCoords, editRects];
    }

    return [imgCoords, []];
  },
  editImages: function ({ canvas, setConfig }) {
    return (e) => {
      const isPointInPath = this.points.some((point, index) =>
        point[1].some((rect, i) => {
          const isPointInPath = this.isPointInRectCheck({
            coords: point[0],
            i,
            x: e.offsetX,
            y: e.offsetY,
          });
          if (isPointInPath) {
            this.selectedPointIndex = index;
            this.selectedRectIndex = i;
          } else {
            this.selectedPointIndex = null;
            this.selectedRectIndex = null;
          }

          return isPointInPath;
        })
      );
      if (isPointInPath) {
        canvas.onmousedown = (e: MouseEvent) => {
          this.isEditing = true;
          canvas.onmousemove = (e: MouseEvent) => {
            this.redrawImages({
              isImageEditMode: true,
              deltaCoords: [e.movementX, e.movementY],
            });
          };
          canvas.onmouseup = (e: MouseEvent) => {
            setConfig((config) => ({
              ...config,
              images: config.images.map((image, index) => ({
                ...image,
                coords:
                  index === this.selectedPointIndex
                    ? this.points[index][0]
                    : image.coords || this.points[index][0],
              })),
            }));
            this.resetState(canvas);
          };
        };
      }
    };
  },
  redrawImages: function ({ isImageEditMode, deltaCoords }) {
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
          isImageEditMode,
          coords: this.points[index][0],
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
        return [0, 0];
    }
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
        return coords;
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
  isPointInRectCheck: function ({ coords, i, x, y }) {
    switch (i) {
      case 0:
        return (
          x > coords[0] &&
          x < coords[0] + editPointRadius &&
          y > coords[1] &&
          y < coords[1] + editPointRadius
        );
      case 1: {
        return (
          x < coords[0] + coords[2] &&
          x > coords[0] + coords[2] - editPointRadius &&
          y > coords[1] &&
          y < coords[1] + editPointRadius
        );
      }
      case 2:
        return (
          x > coords[0] &&
          x < coords[0] + editPointRadius &&
          y < coords[1] + coords[3] &&
          y > coords[1] + coords[3] - editPointRadius
        );
      case 3:
        return (
          x < coords[0] + coords[2] &&
          x > coords[0] + coords[2] - editPointRadius &&
          y < coords[1] + coords[3] &&
          y > coords[1] + coords[3] - editPointRadius
        );
      case 4:
        return (
          x < (coords[0] + coords[2] - editPointRadius) / 2 &&
          x > (coords[0] + coords[2] + editPointRadius) / 2 &&
          y < (coords[1] + coords[3] - editPointRadius) / 2 &&
          y > (coords[1] + coords[3] + editPointRadius) / 2
        );
      default:
        return false;
    }
  },
  resetState: function (canvas) {
    this.isEditing = false;
    canvas.onmousemove = null;
    canvas.onmousedown = null;
    canvas.onmouseup = null;
    this.selectedPointIndex = null;
    this.selectedRectIndex = null;
  },
};
