import React from "react";
import { useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import { Box, Divider } from "@material-ui/core";

import FocusModeButton from "../camera-controls/FocusModeButton";
import FocusZoomButtonsGrid from "../camera-controls/FocusZoomButtonsGrid";
import Joystick from "../camera-controls/Joystick";
import {
  selectCamHeartbeatData,
  selectRecordControlsEnabled,
} from "../camera-controls/cameraControlsSlice";
import useIsOwner from "../../hooks/useIsOwner";

const useStyles = makeStyles((theme) => ({
  root: {
    //flexGrow: 1
  },
}));

export default function CameraControlButtons() {
  const classes = useStyles();
  const camSettings = useSelector(selectCamHeartbeatData);
  const recordControlsEnabled = useSelector(selectRecordControlsEnabled);
  const { isOwner } = useIsOwner();
  console.log("CAM SETTINGS", camSettings);
  // check to make sure camera has controls and current Observer matches Cam Owner
  // also check if Video Source change has completed before displaying
  if (
    camSettings === null ||
    !isOwner ||
    camSettings?.exposure === "ERR" ||
    !recordControlsEnabled
  ) {
    return null;
  }

  return (
    <div className={classes.root}>
      {camSettings?.camctrl === "y" && (
        <>
          <Box my={1}>
            <FocusModeButton />
          </Box>

          <Box my={3}>
            <FocusZoomButtonsGrid />
          </Box>
        </>
      )}

      <Divider />
      {camSettings?.pantilt === "y" && <Joystick />}
    </div>
  );
}
