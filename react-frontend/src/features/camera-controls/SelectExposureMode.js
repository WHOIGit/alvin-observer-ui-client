import React from "react";
import { useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import {
  MenuItem,
  Grid,
  FormControl,
  Select,
  Typography,
} from "@material-ui/core";
// local imports
import { selectCamHeartbeatData } from "./cameraControlsSlice";
import useCameraWebSocket from "../../hooks/useCameraWebSocket";
import useIsOwner from "../../hooks/useIsOwner";
import { COMMAND_STRINGS } from "../../config.js";
import { NEW_CAMERA_COMMAND_EVENT } from "../../config.js";

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  horizLabel: {
    paddingTop: theme.spacing(2),
    paddingRight: theme.spacing(1),
  },
}));

export default function SelectExposureMode({ showLabel }) {
  const classes = useStyles();
  const camSettings = useSelector(selectCamHeartbeatData);
  const { sendMessage } = useCameraWebSocket(NEW_CAMERA_COMMAND_EVENT);
  const { isOwner } = useIsOwner();
  console.log(isOwner);
  const labelText = "EXP:";

  const handleSendMessage = (event) => {
    const payload = {
      action: {
        name: COMMAND_STRINGS.exposureModeCommand,
        value: event.target.value,
      },
    };
    sendMessage(payload);
  };

  // set up label options
  let displayEmpty = true;
  if (showLabel === "vertical") {
    displayEmpty = false;
  }

  // check to make sure camera has controls and current Observer matches Cam Owner
  if (camSettings === null || camSettings?.camctrl === "y" || !isOwner) {
    return null;
  }

  return (
    <Grid container spacing={0}>
      {showLabel && (
        <Grid item xs className={classes.horizLabel}>
          <Typography variant="body1">{labelText}</Typography>
        </Grid>
      )}

      <Grid item xs>
        <FormControl className={classes.formControl}>
          <Select
            id="exposure-select"
            value={camSettings.exposure}
            label={labelText}
            onChange={handleSendMessage}
            displayEmpty={displayEmpty}
          >
            <MenuItem value={COMMAND_STRINGS.exposureModeOptions[0]}>
              Auto
            </MenuItem>
            <MenuItem value={COMMAND_STRINGS.exposureModeOptions[1]}>
              Manual
            </MenuItem>
            <MenuItem value={COMMAND_STRINGS.exposureModeOptions[2]}>
              Shutter Priority
            </MenuItem>
            <MenuItem value={COMMAND_STRINGS.exposureModeOptions[3]}>
              Iris Priority
            </MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
}
