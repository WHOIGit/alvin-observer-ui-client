import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
// local imports
import {
  selectActiveCamera,
  changeCameraSettings
} from "./cameraControlsSlice";
import useCameraWebSocket from "../../hooks/useCameraWebSocket";
import { COMMAND_STRINGS } from "../../config.js";
import { NEW_CAMERA_COMMAND_EVENT } from "../../config.js";

const useStyles = makeStyles(theme => ({
  root: {
    position: "relative"
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120
  }
}));

export default function SelectExposureMode({ showTopControls }) {
  const classes = useStyles();
  const activeCamera = useSelector(selectActiveCamera);
  const { messages, sendMessage } = useCameraWebSocket(
    NEW_CAMERA_COMMAND_EVENT
  );

  const handleSendMessage = event => {
    const payload = {
      camera: activeCamera.camera,
      action: {
        name: COMMAND_STRINGS.exposureModeCommand,
        value: event.target.value
      }
    };
    sendMessage(payload);
  };

  if (activeCamera === undefined) {
    return null;
  }

  return (
    <div className={classes.root}>
      <FormControl className={classes.formControl}>
        <InputLabel id="demo-simple-select-label">Exposure Mode</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={activeCamera.settings.exposureMode}
          onChange={handleSendMessage}
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
    </div>
  );
}
