export const modalStyles = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  maxWidth: "90%",
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  "& h3": {
    mt: 3,
    ml: 2,
    mr: 2,
  },
  "& hr": {
    mt: 2,
    mb: 2,
  },
};

export const modalBodyStyles = {
  overflow: "auto",
  maxHeight: "70vh",
  pt: 1,
};

export const largeModalStyles = {
  ...modalStyles,
  width: "900px",
  maxWidth: "90%",
};

export const hugeModalStyles = {
  ...modalStyles,
  width: "90%",
};

export const fullModalStyles = {
  ...modalStyles,
  width: "94%",
};

export const flexStyles = { display: "flex" };
export const flexInlineStyles = { display: "inline-flex" };
export const flexFullStyles = { ...flexStyles, flex: "1" };
export const flexColStyles = { ...flexStyles, flexDirection: "column" };
export const flexRowStyles = { ...flexStyles, flexDirection: "row" };
export const flexSpaceBetween = {
  ...flexStyles,
  justifyContent: "space-between",
};
export const flexSpaceAround = {
  ...flexStyles,
  justifyContent: "space-around",
};
export const flexJustCentered = { ...flexStyles, justifyContent: "center" };
export const flexJustEnd = { ...flexStyles, justifyContent: "flex-end" };
export const flexJustStart = { ...flexStyles, justifyContent: "flex-start" };
export const flexItemCentered = { ...flexStyles, alignItems: "center" };
export const flexItemStart = { ...flexStyles, alignItems: "flex-start" };
export const flexFullCentered = {
  ...flexJustCentered,
  ...flexItemCentered,
};
export const flexColStartStyles = {
  ...flexColStyles,
  justifyContent: "flex-start",
};
