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

  // Nothing to show until settings arrive, or when the camera doesn't
  // report a focus mode (normalized to null by the imaging-client).
  const focusMode = camData?.currentSettings?.focus_mode;
  if (focusMode == null) {
    return null;
  }

  const focusLabel = `FOCUS: ${focusMode}`;

  return (
    <Chip
      label={focusLabel}
      className={classes.chip}
      color="primary"
      icon={<CenterFocusStrongIcon />}
    />
  );
}
