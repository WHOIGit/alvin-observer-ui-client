import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import makeStyles from '@mui/styles/makeStyles';
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import {
  selectCamHeartbeatData,
  selectCurrentCamData,
  selectExposureControlsEnabled,
} from "./cameraControlsSlice";
import { useObservedCamera } from "./ObservedCameraProvider";
import { EXPOSURE_MODES } from "../../lib/imaging-client";

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
  const controlEnabled = useSelector(selectExposureControlsEnabled);
  const [isEnabled, setIsEnabled] = useState(true);

  const camera = useObservedCamera();

  const handleSendMessage = (event) => {
    camera.setIris(event.target.value);
  };

  useEffect(() => {
    // list of exposure modes that disable this function
    // AUTO, SP
    const disabledExposureModes = [
      EXPOSURE_MODES.AUTO,
      EXPOSURE_MODES.SHUTTER_PRIORITY,
    ];

    // disable if an Exposure mode changes is currently processing
    if (!controlEnabled) {
      setIsEnabled(false);
    } else {
      // set enabled status from camData.currentSettings.exposure_mode
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
          value={isEnabled ? camSettings.iris ?? "" : ""}
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
