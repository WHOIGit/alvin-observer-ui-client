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
  selectCamHeartbeatData,
  setExposureControlsEnabled,
} from "./cameraControlsSlice";
import { useObservedCamera } from "./ObservedCameraProvider";
import useIsOwner from "../../hooks/useIsOwner";
import { EXPOSURE_MODES } from "../../lib/imaging-client";

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

  const camera = useObservedCamera();

  const handleSendMessage = (event) => {
    console.log("TARGET VALUE:", event.target.value);
    camera.setExposureMode(event.target.value);
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
    !camSettings?.isControllable ||
    !isOwner ||
    camSettings?.hasFault
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
            value={camSettings.exposure ?? ""}
            label={labelText}
            onChange={handleSendMessage}
            displayEmpty={displayEmpty}
          >
            <MenuItem value={EXPOSURE_MODES.AUTO}>
              Auto
            </MenuItem>
            <MenuItem value={EXPOSURE_MODES.MANUAL}>
              Manual
            </MenuItem>
            <MenuItem value={EXPOSURE_MODES.SHUTTER_PRIORITY}>
              Shutter Priority
            </MenuItem>
            <MenuItem value={EXPOSURE_MODES.IRIS_PRIORITY}>
              Iris Priority
            </MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
}
