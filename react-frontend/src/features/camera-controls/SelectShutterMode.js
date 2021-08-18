import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import {
  selectCurrentCamData,
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

export default function SelectShutterMode() {
  const classes = useStyles();
  const camData = useSelector(selectCurrentCamData);
  const { messages, sendMessage } = useCameraWebSocket(
    NEW_CAMERA_COMMAND_EVENT
  );

  const handleSendMessage = event => {
    const payload = {
      action: {
        name: COMMAND_STRINGS.shutterModeCommand,
        value: event.target.value
      }
    };
    sendMessage(payload);
  };

  if (camData === null) {
    return null;
  }

  return (
    <div className={classes.root}>
      <FormControl className={classes.formControl}>
        <Select
          labelId="shutter-select-label"
          id="shutter-select"
          value={camData.currentSettings.SHU}
          onChange={handleSendMessage}
        >
          {camData.SHU.map(item => (
            <MenuItem value={item}>Shutter: {item}</MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}
