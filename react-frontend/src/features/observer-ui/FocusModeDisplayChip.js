import React from "react";
import { useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import { Chip } from "@material-ui/core";
import { selectActiveCamera } from "../camera-controls/cameraControlsSlice";

const useStyles = makeStyles(theme => ({
  listItem: {
    width: "100%"
  }
}));

export default function FocusModeDisplayChip() {
  const classes = useStyles();
  const activeCamera = useSelector(selectActiveCamera);

  const focusLabel = `FOCUS: ${activeCamera.settings.focusMode}`;
  return (
    <Chip label={focusLabel} color="secondary" className={classes.listItem} />
  );
}
