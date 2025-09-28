import React, { useState, useEffect } from "react";
import { shallowEqual, useSelector } from "react-redux";
import makeStyles from '@mui/styles/makeStyles';
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import {
  selectActiveCamera,
  selectCamHeartbeatData,
  selectCurrentCamData,
  selectExposureControlsEnabled,
  selectObserverSide,
  selectWebSocketUserNamespace,
} from "./cameraControlsSlice";
import { useDispatch } from "react-redux";
import { useCameraCommandEmitter } from "../../hooks/useCameraCommandEmitter";
import { COMMAND_STRINGS } from "../../config.js";

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

export default function SelectShutterMode() {
  const classes = useStyles();
  const camData = useSelector(selectCurrentCamData, shallowEqual);
  const camSettings = useSelector(selectCamHeartbeatData, shallowEqual);
  const controlEnabled = useSelector(
    selectExposureControlsEnabled,
    shallowEqual
  );
  const dispatch = useDispatch();
  const [isEnabled, setIsEnabled] = useState(true);

  const userNs = useSelector(selectWebSocketUserNamespace);
  const observerSide = useSelector(selectObserverSide);
  const activeCameraId = useSelector(selectActiveCamera);
  const { emit } = useCameraCommandEmitter(`/${userNs}`, {
    activeCamera: activeCameraId,
    observerSide,
  });

  const handleSendMessage = (event) => {
    void emit({
      action: {
        name: COMMAND_STRINGS.shutterModeCommand,
        value: event.target.value,
      },
    });
  };

  useEffect(() => {
    // list of exposure modes that disable this function
    // AUTO, IP
    const disabledExposureModes = [
      COMMAND_STRINGS.exposureModeOptions[0],
      COMMAND_STRINGS.exposureModeOptions[3],
    ];
    // disable if an Exposure mode changes is currently processing
    if (!controlEnabled) {
      setIsEnabled(false);
    } else {
      // set enabled status from camData.currentSettings.exposure_mode
      // if AUTO exposure, disable
      if (camSettings && disabledExposureModes.includes(camSettings.exposure)) {
        setIsEnabled(false);
      } else {
        setIsEnabled(true);
      }
    }
  }, [camSettings, controlEnabled]);

  if (camSettings === null || camData === null) {
    return null;
  }

  return (
    <div className={classes.root}>
      <FormControl variant="standard" className={classes.formControl}>
        <Select
          labelId="shutter-select-label"
          id="shutter-select"
          value={isEnabled ? camSettings.shutter : ""}
          onChange={handleSendMessage}
          disabled={!isEnabled}
        >
          {camData.SHU.map((item) => (
            <MenuItem value={item} key={item}>
              Shutter: {item}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}
