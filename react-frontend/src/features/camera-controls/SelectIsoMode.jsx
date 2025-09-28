import React, { useState, useEffect } from "react";
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
  selectWebSocketNamespace,
} from "./cameraControlsSlice";
import { COMMAND_STRINGS } from "../../config.js";
import { useSelector } from "react-redux";
import { useCameraCommandEmitter } from "../../hooks/useCameraCommandEmitter";

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

export default function SelectIsoMode() {
  const classes = useStyles();
  const camData = useSelector(selectCurrentCamData);
  const camSettings = useSelector(selectCamHeartbeatData);
  const controlEnabled = useSelector(selectExposureControlsEnabled);
  const [isEnabled, setIsEnabled] = useState(true);

  const userNs = useSelector(selectWebSocketNamespace);
  const observerSide = useSelector(selectObserverSide);
  const activeCameraId = useSelector(selectActiveCamera);
  const { emit } = useCameraCommandEmitter(`/${userNs}`, {
    activeCamera: activeCameraId,
    observerSide,
  });

  const handleSendMessage = (event) => {
    void emit({
      action: {
        name: COMMAND_STRINGS.isoModeCommand,
        value: event.target.value,
      },
    });
  };

  useEffect(() => {
    // list of exposure modes that disable this function
    // AUTO, SP, IP
    const disabledExposureModes = [
      COMMAND_STRINGS.exposureModeOptions[0],
      COMMAND_STRINGS.exposureModeOptions[2],
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
          labelId="iso-select-label"
          id="iso-select"
          value={isEnabled ? camSettings.iso : ""}
          onChange={handleSendMessage}
          disabled={!isEnabled}
        >
          {camData.ISO.map((item) => (
            <MenuItem value={item} key={item}>
              ISO: {item}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}
