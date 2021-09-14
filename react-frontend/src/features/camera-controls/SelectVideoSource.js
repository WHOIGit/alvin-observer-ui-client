import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import {
  selectActiveCamera,
  selectObserverSide,
  changeCameraSettings
} from "./cameraControlsSlice";
import useCameraWebSocket from "../../hooks/useCameraWebSocket";
import { COMMAND_STRINGS, NEW_CAMERA_COMMAND_EVENT } from "../../config.js";

const useStyles = makeStyles(theme => ({
  root: {
    position: "relative"
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120
  }
}));

export default function SelectVideoSource({ showTopControls }) {
  const classes = useStyles();
  const activeCamera = useSelector(selectActiveCamera);
  const cameras = useSelector(state => state.cameraControls.availableCameras);
  const { messages, sendMessage } = useCameraWebSocket(
    NEW_CAMERA_COMMAND_EVENT
  );

  const handleSendMessage = event => {
    const payload = {
      action: {
        name: COMMAND_STRINGS.cameraChangeCommand,
        value: event.target.value
      }
    };
    sendMessage(payload);
  };

  if (activeCamera === null) {
    return null;
  }

  return (
    <div className={classes.root}>
      <FormControl className={classes.formControl}>
        <InputLabel id="video-select-label">Video Source</InputLabel>
        <Select
          labelId="video-select-label"
          id="video-select"
          value={activeCamera}
          onChange={handleSendMessage}
        >
          {cameras.map(item => (
            <MenuItem value={item.cam_name}>{item.cam_name}</MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}
