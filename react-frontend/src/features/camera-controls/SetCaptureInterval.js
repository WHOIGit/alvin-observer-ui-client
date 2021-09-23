import React from "react";
import { useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
// local imports
import { selectCurrentCamData } from "./cameraControlsSlice";
import useCameraWebSocket from "../../hooks/useCameraWebSocket";
import { COMMAND_STRINGS } from "../../config.js";
import { NEW_CAMERA_COMMAND_EVENT } from "../../config.js";

const useStyles = makeStyles((theme) => ({
  root: {
    position: "relative",
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 80,
  },
}));

export default function SelectWhiteBalance() {
  const classes = useStyles();
  const camData = useSelector(selectCurrentCamData);
  const { sendMessage } = useCameraWebSocket(NEW_CAMERA_COMMAND_EVENT);

  const handleSendMessage = (event) => {
    const payload = {
      action: {
        name: COMMAND_STRINGS.whiteBalanceCommand,
        value: event.target.value,
      },
    };
    sendMessage(payload);
  };

  return (
    <div className={classes.root}>
      <FormControl className={classes.formControl}>
        <Select
          id="capture-interval-select"
          value={COMMAND_STRINGS.captureIntervalOptions[0]}
          onChange={handleSendMessage}
        >
          <MenuItem value={COMMAND_STRINGS.captureIntervalOptions[0]}>
            {COMMAND_STRINGS.captureIntervalOptions[0]}
          </MenuItem>
          <MenuItem value={COMMAND_STRINGS.captureIntervalOptions[1]}>
            {COMMAND_STRINGS.captureIntervalOptions[1]}
          </MenuItem>
          <MenuItem value={COMMAND_STRINGS.captureIntervalOptions[2]}>
            {COMMAND_STRINGS.captureIntervalOptions[2]}
          </MenuItem>
          <MenuItem value={COMMAND_STRINGS.captureIntervalOptions[3]}>
            {COMMAND_STRINGS.captureIntervalOptions[3]}
          </MenuItem>
        </Select>
      </FormControl>
    </div>
  );
}
