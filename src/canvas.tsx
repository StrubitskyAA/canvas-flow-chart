import {
  ChangeEvent,
  FC,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Box, IconButton } from "@mui/material";

import { canvasConfigType } from "./typescript";

import { defaultCanvasConfig, toolTypesEnum } from "./constants";

import { canvasHelpers } from "./helpers";

import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import EditIcon from "@mui/icons-material/Edit";
import ImagesearchRollerIcon from "@mui/icons-material/ImagesearchRoller";
import ConstructionIcon from "@mui/icons-material/Construction";
import Crop169Icon from "@mui/icons-material/Crop169";
import PanoramaFishEyeIcon from "@mui/icons-material/PanoramaFishEye";
import TimelineIcon from "@mui/icons-material/Timeline";

const Canvas: FC = () => {
  const [isEditMode, setEditMode] = useState<boolean>(false);
  const [isImageEditMode, setImageEditMode] = useState<boolean>(false);
  const [isToolsEditMode, setToolsEditMode] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasWrapRef = useRef<HTMLCanvasElement | null>(null);
  const [config, setConfig] = useState<canvasConfigType>(defaultCanvasConfig);
  const [wrapHeight, setWrapHeight] = useState<number>(0);
  const [wrapWidth, setWrapWidth] = useState<number>(0);
  const [toolType, setToolType] = useState<toolTypesEnum | null>(null);

  const setImage = useCallback((img: File | null) => {
    if (img) {
      setConfig((config) => ({
        ...config,
        images: [...config.images, { img, coords: null }],
      }));
    }
  }, []);
  const setTooltypeHandler = useCallback((type: toolTypesEnum) => {
    setToolType((toolType) => (toolType === type ? null : type));
  }, []);

  useEffect(() => {
    canvasHelpers.setEditingMode({
      isEditMode,
      isImageEditMode,
      isToolsEditMode,
      toolType,
      config,
      setConfig,
    });
  }, [isImageEditMode, isToolsEditMode, isEditMode, config, toolType]);
  useEffect(() => {
    if (canvasRef.current)
      canvasHelpers.canvasDrow({
        canvas: canvasRef.current as HTMLCanvasElement,
        config,
        setConfig,
        canvasHeight: wrapHeight,
        canvasWidth: wrapWidth,
      });
  }, [config.images.length, wrapHeight, wrapWidth]);
  useEffect(() => {
    if (canvasWrapRef.current) {
      setWrapHeight(canvasWrapRef.current.offsetHeight);
      setWrapWidth(canvasWrapRef.current.offsetWidth);
    }
  }, []);

  return (
    <Box sx={{ display: "flex", flex: 1, flexDirection: "column" }}>
      <Box>
        {isToolsEditMode && (
          <>
            <IconButton component="label">
              <Crop169Icon
                color={toolType === toolTypesEnum.rect ? "error" : "primary"}
                onClick={() => setTooltypeHandler(toolTypesEnum.rect)}
              />
            </IconButton>
            <IconButton
              component="label"
              onClick={() => setTooltypeHandler(toolTypesEnum.circle)}
            >
              <PanoramaFishEyeIcon
                color={toolType === toolTypesEnum.circle ? "error" : "primary"}
              />
            </IconButton>
            <IconButton
              component="label"
              onClick={() => setTooltypeHandler(toolTypesEnum.line)}
            >
              <TimelineIcon
                color={toolType === toolTypesEnum.line ? "error" : "primary"}
              />
            </IconButton>
          </>
        )}
        {isImageEditMode && (
          <IconButton component="label">
            <AddPhotoAlternateIcon color="primary" />
            <input
              type="file"
              hidden
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setImage(event.target.files?.[0] || null)
              }
            />
          </IconButton>
        )}
        {isEditMode && (
          <>
            <IconButton
              component="label"
              onClick={() => {
                setToolsEditMode(false);
                setToolType(null);
                setImageEditMode((mode) => !mode);
              }}
            >
              <ImagesearchRollerIcon
                color={isImageEditMode ? "error" : "primary"}
              />
            </IconButton>
            <IconButton
              component="label"
              onClick={() => {
                setImageEditMode(false);
                setToolType(null);
                setToolsEditMode((mode) => !mode);
              }}
            >
              <ConstructionIcon color={isToolsEditMode ? "error" : "primary"} />
            </IconButton>
          </>
        )}
        <IconButton
          onClick={() =>
            setEditMode((isEdit) => {
              setImageEditMode(false);
              setToolsEditMode(false);
              return !isEdit;
            })
          }
        >
          <EditIcon color={isEditMode ? "error" : "primary"} />
        </IconButton>
      </Box>
      <Box
        sx={{
          display: "flex",
          flex: "auto",
          justifyContent: "center",
          overflow: "hidden",
        }}
        ref={canvasWrapRef}
      >
        <canvas ref={canvasRef} height={wrapHeight} width={wrapWidth}></canvas>
      </Box>
    </Box>
  );
};

export default Canvas;
