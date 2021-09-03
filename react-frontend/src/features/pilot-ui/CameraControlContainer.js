import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Paper, Icon, List, ListItem } from "@material-ui/core";
// local
import LargeVideo from "../camera-controls/LargeVideo";
import SelectVideoSource from "../camera-controls/SelectVideoSource";
import SelectShutterMode from "../camera-controls/SelectShutterMode";
import SelectIrisMode from "../camera-controls/SelectIrisMode";
import SelectIsoMode from "../camera-controls/SelectIsoMode";
import SelectExposureMode from "../camera-controls/SelectExposureMode";
import useCameraWebSocket from "../../hooks/useCameraWebSocket";
import {
  selectWebSocketNamespace,
  selectInitialCamHeartbeatData,
  selectActiveCamera,
  changeActiveCamera
} from "../camera-controls/cameraControlsSlice";

import {
  CAM_HEARTBEAT,
  NEW_CAMERA_COMMAND_EVENT,
  COMMAND_STRINGS
} from "../../config";

const useStyles = makeStyles(theme => ({
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary
  }
}));

export default function CameraControlContainer() {
  const classes = useStyles();
  const dispatch = useDispatch();
  // connect to CAM_HEARTBEAT, store current cam parameters in Redux state
  const { messages } = useCameraWebSocket(CAM_HEARTBEAT);
  console.log(messages);
  // connect to newCameraCommand
  const { sendMessage } = useCameraWebSocket(NEW_CAMERA_COMMAND_EVENT);
  const activeCamera = useSelector(selectActiveCamera);
  const initialCamHeartbeat = useSelector(selectInitialCamHeartbeatData);

  const setInitialCamera = () => {
    dispatch(changeActiveCamera(initialCamHeartbeat));

    // send camera change command to set available settings options
    const payload = {
      camera: initialCamHeartbeat.camera,
      action: {
        name: COMMAND_STRINGS.cameraChangeCommand,
        value: initialCamHeartbeat.camera
      }
    };
    sendMessage(payload);
  };

  // use CAM_HEARTBEAT parameters only on initial app load to set activeCamera
  // keep camera params in local state otherwise
  useEffect(() => {
    // set initial camera state only if activeCamera is undefined
    if (activeCamera === null) {
      console.log(initialCamHeartbeat);
      if (initialCamHeartbeat !== null) {
        setInitialCamera();
      }
    }
  }, [activeCamera, setInitialCamera, initialCamHeartbeat]);

  return (
    <>
      <Grid container spacing={2} justify="flex-start" alignItems="center">
        <Grid item xs={6}>
          <SelectVideoSource />
        </Grid>

        <Grid item xs={6}>
          Recording Status
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={9}>
          <LargeVideo />
        </Grid>
        <Grid item xs={3}>
          <List>
            <ListItem>
              <SelectShutterMode />
            </ListItem>
            <ListItem>
              <SelectIrisMode />
            </ListItem>
            <ListItem>
              <SelectIsoMode />
            </ListItem>
            <ListItem>
              <SelectExposureMode />
            </ListItem>
          </List>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs>
          Grid 1
        </Grid>
        <Grid item xs>
          Grid 2
        </Grid>
        <Grid item xs>
          Grid 3
        </Grid>
        <Grid item xs>
          Grid 4
        </Grid>
      </Grid>
    </>
  );
}
