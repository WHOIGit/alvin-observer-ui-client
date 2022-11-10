import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import {
  selectCurrentCamData,
  selectCamHeartbeatData,
} from "./cameraControlsSlice";
import useCameraWebSocket from "../../hooks/useCameraWebSocket";
import { COMMAND_STRINGS } from "../../config.js";
import { NEW_CAMERA_COMMAND_EVENT } from "../../config.js";

const useStyles = makeStyles((theme) => ({
  root: {
    position: "relative",
    width: "100%",
  },
  formControl: {
    //margin: theme.spacing(1),
    width: "100%",
  },
}));

export default function SelectIrisMode() {
  const classes = useStyles();
  const camData = useSelector(selectCurrentCamData);
  const camSettings = useSelector(selectCamHeartbeatData);
  const [isEnabled, setIsEnabled] = useState(true);
  const { sendMessage } = useCameraWebSocket(NEW_CAMERA_COMMAND_EVENT);

  const handleSendMessage = (event) => {
    const payload = {
      action: {
        name: COMMAND_STRINGS.irisModeCommand,
        value: event.target.value,
      },
    };
    sendMessage(payload);
  };

  console.log("render IRIS mode");

  useEffect(() => {
    // list of exposure modes that disable this function
    // AUTO, SP
    const disabledExposureModes = [
      COMMAND_STRINGS.exposureModeOptions[0],
      COMMAND_STRINGS.exposureModeOptions[2],
    ];

    // set enabled status from camData.currentSettings.exposure_mode
    if (camSettings && disabledExposureModes.includes(camSettings.exposure)) {
      setIsEnabled(false);
    } else {
      setIsEnabled(true);
    }
  }, [camSettings]);

  if (camSettings === null || camData === null) {
    return null;
  }

  return (
    <div className={classes.root}>
      <FormControl className={classes.formControl}>
        <Select
          labelId="shutter-select-label"
          id="shutter-select"
          value={isEnabled ? camSettings.iris : ""}
          onChange={handleSendMessage}
          disabled={!isEnabled}
        >
          {camData.IRS.map((item) => (
            <MenuItem value={item} key={item}>
              IRIS: {item}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}
