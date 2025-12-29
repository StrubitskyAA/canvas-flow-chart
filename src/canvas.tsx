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

import { defaultCanvasConfig } from "./constants";

import { canvasHelpers } from "./helpers";

import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import EditIcon from "@mui/icons-material/Edit";
import ImagesearchRollerIcon from "@mui/icons-material/ImagesearchRoller";

const Canvas: FC = () => {
  const [isEditMode, setEditMode] = useState<boolean>(false);
  const [isImageEditMode, setImageEditMode] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasWrapRef = useRef<HTMLCanvasElement | null>(null);
  const [config, setConfig] = useState<canvasConfigType>(defaultCanvasConfig);
  const [wrapHeight, setWrapHeight] = useState<number>(0);
  const [wrapWidth, setWrapWidth] = useState<number>(0);

  const setImage = useCallback((img: File | null) => {
    if (img) {
      setConfig((config) => ({
        ...config,
        images: [...config.images, { img, coords: null }],
      }));
    }
  }, []);

  useEffect(() => {
    canvasHelpers.setEditingMode({
      isEditMode,
      isImageEditMode,
      config,
      setConfig,
    });
  }, [isImageEditMode, isEditMode, config]);
  useEffect(() => {
    if (canvasRef.current)
      canvasHelpers.canvasDrow({
        canvas: canvasRef.current as HTMLCanvasElement,
        config,
        canvasHeight: wrapHeight,
        canvasWidth: wrapWidth,
        setConfig,
      });
  }, [config.images.length]);
  useEffect(() => {
    if (canvasWrapRef.current) {
      setWrapHeight(canvasWrapRef.current.offsetHeight);
      setWrapWidth(canvasWrapRef.current.offsetWidth);
    }
  }, []);

  return (
    <Box sx={{ display: "flex", flex: 1, flexDirection: "column" }}>
      <Box>
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
          <IconButton
            component="label"
            onClick={() => setImageEditMode((mode) => !mode)}
          >
            <ImagesearchRollerIcon
              color={isImageEditMode ? "error" : "primary"}
            />
          </IconButton>
        )}
        <IconButton
          onClick={() =>
            setEditMode((isEdit) => {
              setImageEditMode(false);
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
