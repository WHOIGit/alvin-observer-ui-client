import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import { selectCurrentCamData } from "./cameraControlsSlice";
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
  const currentCamData = useSelector(selectCurrentCamData);
  const { messages, sendMessage } = useCameraWebSocket(
    NEW_CAMERA_COMMAND_EVENT
  );

  const handleSendMessage = event => {
    const payload = {
      action: {
        name: COMMAND_STRINGS.isoModeCommand,
        value: event.target.value
      }
    };
    sendMessage(payload);
  };

  if (currentCamData === undefined) {
    return null;
  }

  return (
    <div className={classes.root}>
      <FormControl className={classes.formControl}>
        <Select
          labelId="iso-select-label"
          id="iso-select"
          value={currentCamData.currentSettings.ISO}
          onChange={handleSendMessage}
        >
          {currentCamData.ISO.map(item => (
            <MenuItem value={item}>ISO: {item}</MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}
