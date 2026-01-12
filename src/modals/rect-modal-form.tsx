import { ChangeEvent, FC } from "react";
import { Grid, TextField } from "@mui/material";
import { FormikErrors } from "formik";

import { toolType } from "../typescript";

import { initialColor, toolTypesEnum } from "../constants";

const RectModalForm: FC<{
  values: toolType;
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean | undefined
  ) => Promise<void> | Promise<FormikErrors<toolType>>;
  handleChange: (e: string | ChangeEvent<any>) => void;
}> = ({ values, setFieldValue, handleChange }) => (
  <Grid container spacing={2}>
    <Grid size={6}>
      Цвет элемента:
      <input
        type="color"
        value={values.fill || initialColor}
        onChange={(e) => setFieldValue("fill", e.target.value)}
      />
    </Grid>
    <Grid size={6}>
      Цвет обводки:
      <input
        type="color"
        value={values.stroke || initialColor}
        onChange={(e) => setFieldValue("stroke", e.target.value)}
      />
    </Grid>
    <Grid size={6}>
      <TextField
        value={values.strokeWidth}
        size="small"
        label="Ширина обводки:"
        name="strokeWidth"
        onChange={handleChange}
      />
    </Grid>
    <Grid size={6}>
      <TextField
        value={values.angle}
        size="small"
        label="Угол поворота:"
        name="angle"
        onChange={handleChange}
      />
    </Grid>
    {values.type === toolTypesEnum.rect && (
      <Grid size={6}>
        <TextField
          value={values.round}
          size="small"
          label="Радиус округления:"
          name="round"
          onChange={handleChange}
        />
      </Grid>
    )}
  </Grid>
);

export default RectModalForm;
