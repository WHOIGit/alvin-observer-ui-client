import React from "react";
import { useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import {
  MenuItem,
  FormControl,
  Select,
  Grid,
  Typography,
} from "@material-ui/core";
import { selectActiveCamera } from "./cameraControlsSlice";
import useCameraWebSocket from "../../hooks/useCameraWebSocket";
import { COMMAND_STRINGS, NEW_CAMERA_COMMAND_EVENT } from "../../config.js";

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

export default function SelectVideoSource({ showLabel }) {
  const classes = useStyles();
  const activeCamera = useSelector(selectActiveCamera);
  const cameras = useSelector((state) => state.cameraControls.availableCameras);
  const { sendMessage } = useCameraWebSocket(NEW_CAMERA_COMMAND_EVENT);
  const labelText = "SRC:";

  const handleSendMessage = (event) => {
    const payload = {
      action: {
        name: COMMAND_STRINGS.cameraChangeCommand,
        value: event.target.value,
      },
    };
    sendMessage(payload);
  };

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
            id="video-select"
            value={activeCamera}
            onChange={handleSendMessage}
            displayEmpty
            inputProps={{ "aria-label": "Without label" }}
          >
            {cameras.map((item) => (
              <MenuItem value={item.camera} key={item.camera}>
                {item.cam_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
}
