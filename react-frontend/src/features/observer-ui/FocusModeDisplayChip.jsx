import React from "react";
import { useSelector } from "react-redux";
import makeStyles from '@mui/styles/makeStyles';
import { Chip } from "@mui/material";
import CenterFocusStrongIcon from "@mui/icons-material/CenterFocusStrong";
// local
import { selectCurrentCamData } from "../camera-controls/cameraControlsSlice";

const useStyles = makeStyles(theme => ({
  chip: {
    width: "100%",
    color: "white",
    backgroundColor: theme.palette.success.main
  }
}));

export default function FocusModeDisplayChip() {
  const classes = useStyles();
  const camData = useSelector(selectCurrentCamData);

  if (camData === null) {
    return null;
  }

  const focusLabel = `FOCUS: ${camData.currentSettings.focus_mode}`;

  return (
    <Chip
      label={focusLabel}
      className={classes.chip}
      color="primary"
      icon={<CenterFocusStrongIcon />}
    />
  );
}
