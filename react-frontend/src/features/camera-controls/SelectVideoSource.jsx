import React, { useState, useEffect } from "react";
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
  selectObserverSide,
  selectVideoSourceEnabled,
  selectWebSocketNamespace,
  setRecordControlsEnabled,
  setVideoSourceEnabled,
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

export default function SelectVideoSource({ showLabel }) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const activeCamera = useSelector(selectActiveCamera);
  const videoSourceEnabled = useSelector(selectVideoSourceEnabled);
  const cameras = useSelector(selectAllCameras);
  const [requestedSource, setRequestedSource] = useState(null);
  const { isOwner } = useIsOwner();
  const labelText = "SOURCE:";

  const userNs = useSelector(selectWebSocketNamespace);
  const observerSide = useSelector(selectObserverSide);
  const { emit } = useCameraCommandEmitter(`/${userNs}`, {
    activeCamera,
    observerSide,
  });

  useEffect(() => {
    if (requestedSource === activeCamera || requestedSource === null) {
      if (!isOwner) {
        // non-owned camera changes confirm change too fast,
        // add a "fake" delay to UI to show users that camera change is happening
        setTimeout(() => {
          dispatch(setRecordControlsEnabled(true));
        }, 2000);
      } else {
        dispatch(setRecordControlsEnabled(true));
      }
      dispatch(setVideoSourceEnabled(true));
    } else {
      dispatch(setRecordControlsEnabled(false));
      dispatch(setVideoSourceEnabled(false));
    }
  }, [requestedSource, activeCamera, dispatch, isOwner, cameras]);

  const handleSendMessage = (event) => {
    void emit({
      action: {
        name: COMMAND_STRINGS.cameraChangeCommand,
        value: event.target.value,
      },
    });
    setRequestedSource(event.target.value);
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
