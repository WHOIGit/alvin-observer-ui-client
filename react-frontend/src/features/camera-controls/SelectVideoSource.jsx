import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import makeStyles from '@mui/styles/makeStyles';
import {
  MenuItem,
  FormControl,
  Select,
  Grid,
  Typography,
} from "@mui/material";
import {
  selectActiveCamera,
  selectAllCameras,
  selectVideoSourceEnabled,
  setRecordControlsEnabled,
  setVideoSourceEnabled,
} from "./cameraControlsSlice";
import { useObservedStation } from "./ObservedCameraProvider";
import useIsOwner from "../../hooks/useIsOwner";

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

// How long a camera select waits for its receipt before handing control
// back; the server's confirmation can take several seconds.
const CONFIRM_TIMEOUT_MS = 12000;

export default function SelectVideoSource({ showLabel }) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const activeCamera = useSelector(selectActiveCamera);
  const videoSourceEnabled = useSelector(selectVideoSourceEnabled);
  const cameras = useSelector(selectAllCameras);
  const { isOwner } = useIsOwner();
  const labelText = "SOURCE:";

  const station = useObservedStation();

  // Timers owned by an in-flight selection; cleared on unmount.
  const timersRef = useRef([]);
  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

  const handleSendMessage = async (event) => {
    dispatch(setVideoSourceEnabled(false));
    dispatch(setRecordControlsEnabled(false));

    // The command's promise settles on the server's receipt — the same
    // outcome that updates activeCamera in the store. A failed or missing
    // receipt hands control back (via the timeout) instead of wedging the
    // menu until the receipt shows up.
    const command = station.selectCamera(event.target.value, { activeCamera });
    await Promise.race([
      command.catch(() => {}),
      new Promise((resolve) => {
        timersRef.current.push(setTimeout(resolve, CONFIRM_TIMEOUT_MS));
      }),
    ]);

    dispatch(setVideoSourceEnabled(true));
    if (isOwner) {
      dispatch(setRecordControlsEnabled(true));
    } else {
      // non-owned camera changes confirm change too fast,
      // add a "fake" delay to UI to show users that camera change is happening
      timersRef.current.push(
        setTimeout(() => dispatch(setRecordControlsEnabled(true)), 2000)
      );
    }
  };

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
            id="video-select"
            value={activeCamera || ""}
            onChange={handleSendMessage}
            displayEmpty
            disabled={!videoSourceEnabled}
            inputProps={{ "aria-label": "Video Source" }}
          >
            {cameras.map((item) => (
              <MenuItem value={item.camera} key={item.camera}>
                {item.cam_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
}
