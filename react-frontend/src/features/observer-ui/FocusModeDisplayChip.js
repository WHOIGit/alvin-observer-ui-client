import React from "react";
import { useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import { Chip } from "@material-ui/core";
import CenterFocusStrongIcon from "@material-ui/icons/CenterFocusStrong";
// local
import { selectActiveCamera } from "../camera-controls/cameraControlsSlice";

const useStyles = makeStyles(theme => ({
  chip: {
    width: "100%",
    color: "white",
    backgroundColor: theme.palette.success.main
  }
}));

export default function FocusModeDisplayChip() {
  const classes = useStyles();
  const activeCamera = useSelector(selectActiveCamera);

  if (activeCamera === undefined) {
    return null;
  }

  const focusLabel = `FOCUS: ${activeCamera.settings.focusMode}`;

  return (
    <Chip
      label={focusLabel}
      className={classes.chip}
      color="primary"
      icon={<CenterFocusStrongIcon />}
    />
  );
}
