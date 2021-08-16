import React, { useState, useEffect } from "react";
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
import { CAM_HEARTBEAT } from "../../config";

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
  // connect to CAM_HEARTBEAT, store current cam parameters in Redux state
  const { messages, sendMessage } = useCameraWebSocket(CAM_HEARTBEAT);

  const activeCamera = useSelector(selectActiveCamera);
  const camHeartbeatData = useSelector(selectCamHeartbeatData);
  // use CAM_HEARTBEAT parameters only on initial app load to set activeCamera
  // keep camera params in local state otherwise
  useEffect(() => {
    // set initial camera state only if activeCamera is undefined
    if (activeCamera === undefined) {
      console.log(camHeartbeatData);
      if (camHeartbeatData !== null) {
        dispatch(changeActiveCamera(camHeartbeatData));
      }
    }
  }, [activeCamera]);

  return (
    <TopControlPanel
      showFullCameraControls={showFullCameraControls}
      setShowFullCameraControls={setShowFullCameraControls}
    />
  );
}
