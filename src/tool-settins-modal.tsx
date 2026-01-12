import { Dispatch, FC, SetStateAction, useEffect, useMemo } from "react";
import { useFormik } from "formik";
import _ from "lodash";

import { canvasConfigType, toolType } from "./typescript";
import {
  Box,
  Button,
  Divider,
  IconButton,
  Modal,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import { initialToolTypeValue, toolTypesEnum } from "./constants";

import GetToolModalForm from "./get-tool-modal-form";

import {
  flexItemCentered,
  flexSpaceBetween,
  modalBodyStyles,
  modalStyles,
} from "./styles";

const ToolSettingsModal: FC<{
  tool: toolType | null;
  setConfig: Dispatch<SetStateAction<canvasConfigType>>;
  editableToolIndex: number | null;
  onClose: () => void;
}> = ({ tool, setConfig, editableToolIndex, onClose }) => {
  const { values, handleSubmit, setFieldValue, handleChange, setValues } =
    useFormik<toolType>({
      initialValues: initialToolTypeValue,
      onSubmit: async (values: toolType) => {
        setConfig((config) => ({
          ...config,
          tools: config.tools.map((tool, i) =>
            i === editableToolIndex ? values : tool
          ),
        }));
        onClose();
      },
    });

  const ModalForm = useMemo(
    () => GetToolModalForm(tool?.type || toolTypesEnum.line),
    [tool?.type]
  );

  useEffect(() => {
    setValues(tool || initialToolTypeValue);
  }, [editableToolIndex]);

  return (
    <Modal open={_.isNumber(editableToolIndex)} onClose={() => onClose()}>
      <Box sx={modalStyles}>
        <Typography
          sx={{ ...flexSpaceBetween, ...flexItemCentered, pr: 1 }}
          variant="h6"
          component="h3"
        >
          <Box sx={{ width: "100%" }}>Редактирование элемента</Box>
          <IconButton onClick={() => onClose()} size="small" color={"error"}>
            <CloseIcon />
          </IconButton>
        </Typography>
        <Divider />
        <Box sx={modalBodyStyles}>
          <ModalForm
            setFieldValue={setFieldValue}
            values={values}
            handleChange={handleChange}
          />
        </Box>
        <Divider />
        <Box sx={{ ...flexSpaceBetween, pl: 2, pr: 2, pb: 2 }}>
          <Button
            variant={"contained"}
            color={"error"}
            onClick={() => onClose()}
          >
            Отмена
          </Button>
          <Button
            variant={"contained"}
            color={"primary"}
            onClick={() => handleSubmit()}
          >
            Изменить
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ToolSettingsModal;
