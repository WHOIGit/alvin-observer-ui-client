import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import Link from "@material-ui/core/Link";
import { Grid, Paper, Icon, Fab } from "@material-ui/core";
import TopControlPanel from "./TopControlPanel";
import useCameraWebSocket from "../../hooks/useCameraWebSocket";
import {
  selectWebSocketNamespace,
  selectCamHeartbeatData,
  selectActiveCamera,
  changeActiveCamera
} from "../camera-controls/cameraControlsSlice";
import {
  CAM_HEARTBEAT,
  NEW_CAMERA_COMMAND_EVENT,
  COMMAND_STRINGS
} from "../../config";

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: "#f5f5f5",
    position: "relative",
    marginTop: 0,
    paddingBottom: 0,
    width: "100%",
    padding: theme.spacing(2),
    zIndex: 1000,
    transition: "all 0.4s",
    minHeight: "290px"
  },
  rootCollapse: {
    marginTop: "-290px",
    height: 0
  },
  toggleButton: {
    position: "absolute",
    bottom: -Math.abs(theme.spacing(8)),
    right: theme.spacing(2),
    zIndex: 2000,
    transition: "all 0.4s"
  },
  toggleButtonOff: {
    bottom: "-500px"
  },
  extendedIcon: {
    marginRight: theme.spacing(1)
  }
}));

export default function ObserverUI({
  showFullCameraControls,
  setShowFullCameraControls
}) {
  const classes = useStyles();
  const dispatch = useDispatch();
  console.log("RENDERING");
  // connect to newCameraCommand
  const { sendMessage } = useCameraWebSocket(NEW_CAMERA_COMMAND_EVENT);

  const activeCamera = useSelector(selectActiveCamera);
  const camHeartbeatData = useSelector(selectCamHeartbeatData);

  const setInitialCamera = useCallback(() => {
    dispatch(changeActiveCamera(camHeartbeatData));

    // send camera change command to set available settings options
    const payload = {
      camera: camHeartbeatData.camera,
      action: {
        name: COMMAND_STRINGS.cameraChangeCommand,
        value: camHeartbeatData.camera
      }
    };
    sendMessage(payload);
  });

  // use CAM_HEARTBEAT parameters only on initial app load to set activeCamera
  // keep camera params in local state otherwise
  useEffect(() => {
    // set initial camera state only if activeCamera is undefined
    if (activeCamera === null) {
      console.log(camHeartbeatData);
      if (camHeartbeatData !== null) {
        setInitialCamera();
      }
    }
  }, [setInitialCamera]);

  return (
    <TopControlPanel
      showFullCameraControls={showFullCameraControls}
      setShowFullCameraControls={setShowFullCameraControls}
    />
  );
}
