import { ChangeEvent, FC } from "react";
import { FormikErrors } from "formik";

import { toolType } from "./typescript";

import { toolTypesEnum } from "./constants";

import LineModalForm from "./modals/line-modal-form";
import RectModalForm from "./modals/rect-modal-form";

const GetToolModalForm = (
  type: toolTypesEnum
): FC<{
  values: toolType;
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean | undefined
  ) => Promise<void> | Promise<FormikErrors<toolType>>;
  handleChange: (e: string | ChangeEvent<any>) => void;
}> => {
  switch (type) {
    case toolTypesEnum.line:
    case toolTypesEnum.switch:
      return LineModalForm;
    case toolTypesEnum.rect:
    case toolTypesEnum.circle:
      return RectModalForm;
    default:
      return RectModalForm;
  }
};

export default GetToolModalForm;
