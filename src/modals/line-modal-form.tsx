import { FC, ChangeEvent } from "react";
import { FormikErrors } from "formik";
import { Grid, TextField } from "@mui/material";

import { toolType } from "../typescript";

import { initialColor } from "../constants";

const LineModalForm: FC<{
  values: toolType;
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean | undefined
  ) => Promise<void> | Promise<FormikErrors<toolType>>;
  handleChange: (e: string | ChangeEvent<any>) => void;
}> = ({ values, setFieldValue, handleChange }) => {
  return (
    <Grid container spacing={2}>
      <Grid size={6}>
        Цвет линии:
        <input
          type="color"
          value={values.stroke || initialColor}
          onChange={(e) => setFieldValue("stroke", e.target.value)}
        />
      </Grid>
      <Grid size={6}>
        <TextField
          size="small"
          label="Ширина линии:"
          name="strokeWidth"
          onChange={handleChange}
        />
      </Grid>
    </Grid>
  );
};

export default LineModalForm;
