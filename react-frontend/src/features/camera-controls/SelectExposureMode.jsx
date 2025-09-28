import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import makeStyles from '@mui/styles/makeStyles';
import {
  MenuItem,
  Grid,
  FormControl,
  Select,
  Typography,
} from "@mui/material";
// local imports
import {
  selectActiveCamera,
  selectCamHeartbeatData,
  selectObserverSide,
  selectWebSocketUserNamespace,
  setExposureControlsEnabled,
} from "./cameraControlsSlice";
import { useCameraCommandEmitter } from "../../hooks/useCameraCommandEmitter";
import useIsOwner from "../../hooks/useIsOwner";
import { COMMAND_STRINGS } from "../../config.js";

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  horizLabel: {
    paddingTop: theme.spacing(2),
    paddingRight: theme.spacing(1),
  },
}));

export default function SelectExposureMode({ showLabel }) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const camSettings = useSelector(selectCamHeartbeatData);
  const { isOwner } = useIsOwner();
  const [expModeRequested, setExpModeRequested] = useState(null);
  const labelText = "EXP MODE:";
  //console.log(camSettings);

  const userNs = useSelector(selectWebSocketUserNamespace);
  const observerSide = useSelector(selectObserverSide);
  const activeCameraId = useSelector(selectActiveCamera);
  const { emit } = useCameraCommandEmitter(`/${userNs}`, {
    activeCamera: activeCameraId,
    observerSide,
  });

  const handleSendMessage = (event) => {
    console.log("TARGET VALUE:", event.target.value);
    void emit({
      action: {
        name: COMMAND_STRINGS.exposureModeCommand,
        value: event.target.value,
      },
    });
    setExpModeRequested(event.target.value);
  };

  useEffect(() => {
    // set initial
    if (camSettings) setExpModeRequested(camSettings.exposure);
  }, []);

  useEffect(() => {
    // check if requested Exposure mode change has completed
    // save result in Redux
    if (
      camSettings?.exposure !== expModeRequested &&
      expModeRequested !== null
    ) {
      dispatch(setExposureControlsEnabled(false));
    } else {
      dispatch(setExposureControlsEnabled(true));
    }
  }, [camSettings, dispatch, expModeRequested]);

  // set up label options
  let displayEmpty = true;
  if (showLabel === "vertical") {
    displayEmpty = false;
  }

  // check to make sure camera has controls, current Observer matches Cam Owner, camera is available
  if (
    camSettings === null ||
    camSettings?.camctrl === "n" ||
    !isOwner ||
    camSettings?.exposure === "ERR"
  ) {
    return null;
  }

  return (
    <Grid container spacing={0}>
      {showLabel && (
        <Grid item xs className={classes.horizLabel}>
          <Typography variant="body1">{labelText}</Typography>
        </Grid>
      )}

      <Grid item xs>
        <FormControl variant="standard" className={classes.formControl}>
          <Select
            id="exposure-select"
            value={camSettings.exposure}
            label={labelText}
            onChange={handleSendMessage}
            displayEmpty={displayEmpty}
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
      </Grid>
    </Grid>
  );
}
