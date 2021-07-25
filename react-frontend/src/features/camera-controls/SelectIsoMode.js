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
  changeCameraSettings
} from "./cameraControlsSlice";
import useCameraWebSocket from "../../hooks/useCameraWebSocket";
import { COMMAND_STRINGS } from "../../config.js";
import { NEW_CAMERA_COMMAND_EVENT } from "../../config.js";

const useStyles = makeStyles(theme => ({
  root: {
    position: "relative",
    width: "100%"
  },
  formControl: {
    //margin: theme.spacing(1),
    width: "100%"
  }
}));

export default function SelectIsoMode() {
  const classes = useStyles();
  const activeCamera = useSelector(selectActiveCamera);
  const { messages, sendMessage } = useCameraWebSocket(
    NEW_CAMERA_COMMAND_EVENT
  );

  const handleSendMessage = event => {
    const payload = {
      camera: activeCamera.camera,
      action: {
        name: COMMAND_STRINGS.isoModeCommand,
        value: event.target.value
      }
    };
    sendMessage(payload);
  };

  return (
    <div className={classes.root}>
      <FormControl className={classes.formControl}>
        <Select
          labelId="iso-select-label"
          id="iso-select"
          value={activeCamera.settings.isoMode}
          onChange={handleSendMessage}
        >
          <MenuItem value={COMMAND_STRINGS.isoModeOptions[0]}>
            ISO: Auto
          </MenuItem>
          <MenuItem value={COMMAND_STRINGS.isoModeOptions[1]}>
            ISO: Value 1
          </MenuItem>
          <MenuItem value={COMMAND_STRINGS.isoModeOptions[2]}>
            ISO: Value 2
          </MenuItem>
        </Select>
      </FormControl>
    </div>
  );
}
