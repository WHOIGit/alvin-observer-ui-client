import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Box, Divider } from "@material-ui/core";

import FocusModeButton from "../camera-controls/FocusModeButton";
import FocusZoomButtons from "../camera-controls/FocusZoomButtons";
import Joystick from "../camera-controls/Joystick";

const useStyles = makeStyles(theme => ({
  root: {
    //flexGrow: 1
  }
}));

export default function CameraControlButtons() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Box my={1}>
        <FocusModeButton />
      </Box>

      <Box my={3}>
        <FocusZoomButtons />
      </Box>
      <Divider />
      <Joystick />
    </div>
  );
}
