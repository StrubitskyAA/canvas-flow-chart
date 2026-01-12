import _ from "lodash";

import { canvasCoordsType, pointCoordsType, toolType } from "./typescript";

import {
  activeColor,
  editPointRadius,
  initialColor,
  minToolLength,
  toolTypesEnum,
  transparentColor,
} from "./constants";

import GetStringSvg from "./svg/get-string-svg";

const calcLineLength = (coords: canvasCoordsType) =>
  Math.sqrt(
    Math.pow(coords[0] - coords[2], 2) + Math.pow(coords[1] - coords[3], 2)
  );
const calcRectLength = (coords: canvasCoordsType) =>
  Math.sqrt(Math.pow(coords[2], 2) + Math.pow(coords[3], 2));

export const getToolLength = (tool: toolType) => {
  if (!tool) return 0;
  switch (tool.type) {
    case toolTypesEnum.line:
    case toolTypesEnum.switch: {
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
    case toolTypesEnum.switch:
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
    case toolTypesEnum.rect:
      return [
        ...(toolType
          ? startCoords || [coords[0], coords[1]]
          : [coords[0] + changeCoords[0], coords[1] + changeCoords[1]]),
        ...(toolType
          ? [coords[2] + changeCoords[0], coords[3] + changeCoords[1]]
          : [coords[2], coords[3]]),
      ] as canvasCoordsType;
    case toolTypesEnum.circle:
      return [
        ...(toolType
          ? startCoords && endCoords
            ? [
                Math.min(startCoords[0], endCoords[0]) +
                  Math.abs(Math.floor((startCoords[0] - endCoords[0]) / 2)),
                Math.min(startCoords[1], endCoords[1]) +
                  Math.abs(Math.floor((startCoords[1] - endCoords[1]) / 2)),
              ]
            : [coords[0], coords[1]]
          : [coords[0] + changeCoords[0], coords[1] + changeCoords[1]]),
        ...(toolType && startCoords && endCoords
          ? [
              Math.abs(Math.floor((startCoords[0] - endCoords[0]) / 2)),
              Math.abs(Math.floor((startCoords[1] - endCoords[1]) / 2)),
            ]
          : [coords[2], coords[3]]),
      ] as canvasCoordsType;
    default:
      return [0, 0, 0, 0];
  }
};

export const drawLine = ({
  tool,
  isActive,
  ctx,
}: {
  tool: toolType;
  isActive: boolean;
  ctx: CanvasRenderingContext2D;
}): Path2D => {
  const path = new Path2D();
  path.moveTo(tool.coords[0], tool.coords[1]);
  path.lineTo(tool.coords[2], tool.coords[3]);
  ctx.strokeStyle = isActive
    ? activeColor
    : (tool.stroke as string) || initialColor;
  ctx.lineWidth = tool.strokeWidth || editPointRadius / 2;
  ctx.stroke(path);

  return path;
};

const calcMiddleCoord = (coordStart: number, coordEnd: number, ratio: number) =>
  Math.round((coordEnd - coordStart) * ratio) + coordStart;
const calcLineAngle = (coords: canvasCoordsType) =>
  Math.atan((coords[3] - coords[1]) / (coords[2] - coords[0]));

export const drawSwitch = ({
  tool,
  isActive,
  ctx,
}: {
  tool: toolType;
  isActive: boolean;
  ctx: CanvasRenderingContext2D;
}) => {
  const path = drawLine({
    tool: { ...tool, stroke: "transparent" },
    isActive: false,
    ctx,
  });
  const length = calcLineLength(tool.coords);

  if (length < minToolLength) {
    drawLine({
      tool: tool,
      isActive: true,
      ctx,
    });
  } else {
    const ratio = (length - minToolLength) / 2 / length;
    const middleCoords = [
      calcMiddleCoord(tool.coords[0], tool.coords[2], ratio),
      calcMiddleCoord(tool.coords[1], tool.coords[3], ratio),
      calcMiddleCoord(tool.coords[2], tool.coords[0], ratio),
      calcMiddleCoord(tool.coords[3], tool.coords[1], ratio),
    ];
    const angle = calcLineAngle(tool.coords);

    drawLine({
      tool: {
        ...tool,
        coords: [
          tool.coords[0],
          tool.coords[1],
          middleCoords[0],
          middleCoords[1],
        ],
      },
      isActive,
      ctx,
    });
    drawLine({
      tool: {
        ...tool,
        coords: [
          middleCoords[2],
          middleCoords[3],
          tool.coords[2],
          tool.coords[3],
        ],
      },
      isActive,
      ctx,
    });
    drawSvg({
      startCoords: [tool.coords[0], tool.coords[1]],
      tool: {
        coords: [
          tool.coords[0] + Math.round((length - minToolLength) / 2) - 2,
          tool.coords[1] - Math.round(minToolLength / 2),
          minToolLength + 4,
          minToolLength,
        ],
        type: toolTypesEnum.switch,
        angle: tool.coords[0] > tool.coords[2] ? Math.PI + angle : angle,
        strokeWidth: tool.strokeWidth,
      },
      isActive,
      isOpen: true,
      ctx,
    });
  }

  return path;
};

const getImgAttribute = (
  type: toolTypesEnum,
  isActive: boolean,
  isOpen?: boolean
) => `${type}${isActive ? "-active" : ""}${isOpen ? "-open" : ""}`;

export const drawSvg = ({
  startCoords,
  tool,
  isActive,
  isOpen,
  ctx,
}: {
  startCoords: pointCoordsType;
  tool: toolType;
  isActive: boolean;
  isOpen?: boolean;
  ctx: CanvasRenderingContext2D;
}) => {
  const svgString = GetStringSvg({
    isActive,
    isOpen,
    stroke: tool.stroke as string,
    type: tool.type,
    strokeWidth: tool.strokeWidth,
  });
  let img: HTMLImageElement = document.querySelector(
    `[img-data="${getImgAttribute(tool.type, isActive, isOpen)}"]`
  ) as HTMLImageElement;
  ctx.translate(startCoords[0], startCoords[1]);
  ctx.rotate(tool.angle as number);
  ctx.translate(-startCoords[0], -startCoords[1]);
  if (!img) {
    const svgBlob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(svgBlob);
    img = document.createElement("img");
    document.body.appendChild(img);
    img.setAttribute("src", URL.createObjectURL(svgBlob));
    img.setAttribute("class", "hidden back");
    img.setAttribute("img-data", getImgAttribute(tool.type, isActive, isOpen));
    img.onload = function () {
      ctx.drawImage(img, tool.coords[0], tool.coords[1]);
      ctx.translate(startCoords[0], startCoords[1]);
      ctx.rotate(-(tool.angle as number));
      ctx.translate(-startCoords[0], -startCoords[1]);
    };
    img.src = url;
  } else {
    ctx.drawImage(img, tool.coords[0], tool.coords[1]);
    ctx.translate(startCoords[0], startCoords[1]);
    ctx.rotate(-(tool.angle as number));
    ctx.translate(-startCoords[0], -startCoords[1]);
  }
};

export const drawRect = ({
  tool,
  isActive,
  ctx,
}: {
  tool: toolType;
  isActive: boolean;
  ctx: CanvasRenderingContext2D;
}): Path2D => {
  const path = new Path2D();
  tool.round
    ? path.roundRect(
        tool.coords[0],
        tool.coords[1],
        tool.coords[2],
        tool.coords[3],
        _.toNumber(tool.round) || 0
      )
    : path.rect(tool.coords[0], tool.coords[1], tool.coords[2], tool.coords[3]);
  ctx.fillStyle = isActive
    ? activeColor
    : (tool.fill as string) || initialColor;
  ctx.strokeStyle = isActive
    ? activeColor
    : (tool.stroke as string) || initialColor;
  ctx.lineWidth = tool.strokeWidth || editPointRadius / 4;
  ctx.rotate(0);
  const [centrX, centrY] = [
    tool.coords[0] + Math.floor(tool.coords[2] / 2),
    tool.coords[1] + Math.floor(tool.coords[3] / 2),
  ];
  const angle = getAngleInRadians(tool.angle);
  if (tool.fill !== transparentColor) {
    if (angle) {
      ctx.translate(centrX, centrY);
      ctx.rotate(angle);
      ctx.translate(-centrX, -centrY);
    }
    ctx.fill(path);
    ctx.stroke(path);
    if (tool.angle) {
      ctx.translate(centrX, centrY);
      ctx.rotate(-angle);
      ctx.translate(-centrX, -centrY);
    }
  }

  return path;
};

const getAngleInRadians = (angle?: string | number) =>
  (_.toNumber(angle || 0) / 180) * Math.PI;

export const drawEllipse = ({
  tool,
  isActive,
  ctx,
}: {
  tool: toolType;
  isActive: boolean;
  ctx: CanvasRenderingContext2D;
}): Path2D => {
  const path = new Path2D();
  path.ellipse(
    tool.coords[0],
    tool.coords[1],
    tool.coords[2],
    tool.coords[3],
    getAngleInRadians(tool.angle),
    0,
    2 * Math.PI
  );
  ctx.fillStyle = isActive
    ? activeColor
    : (tool.fill as string) || initialColor;
  ctx.strokeStyle = isActive
    ? activeColor
    : (tool.stroke as string) || initialColor;
  ctx.lineWidth = tool.strokeWidth || editPointRadius / 4;
  if (tool.fill !== transparentColor) ctx.fill(path);
  if (tool.stroke !== transparentColor) ctx.stroke(path);

  return path;
};

export const getToolInitialCoords = ({
  startCoords,
  toolType,
}: {
  startCoords?: pointCoordsType;
  toolType: toolTypesEnum;
}): canvasCoordsType => {
  switch (toolType) {
    case toolTypesEnum.line: {
      return [...(startCoords || [0, 0]), ...(startCoords || [0, 0])];
    }
    case toolTypesEnum.rect:
      return [...(startCoords || [0, 0]), 0, 0];
    default:
      return [0, 0, 0, 0];
  }
};
