import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import TopControlPanel from "./TopControlPanel";
import useCameraWebSocket from "../../hooks/useCameraWebSocket";
import {
  selectInitialCamHeartbeatData,
  selectActiveCamera,
  changeActiveCamera,
} from "../camera-controls/cameraControlsSlice";
import {
  CAM_HEARTBEAT,
  NEW_CAMERA_COMMAND_EVENT,
  COMMAND_STRINGS,
} from "../../config";

const useStyles = makeStyles((theme) => ({
  root: {
    //backgroundColor: "#f5f5f5",
    position: "relative",
    marginTop: 0,
    paddingBottom: 0,
    width: "100%",
    padding: theme.spacing(2),
    zIndex: 1000,
    transition: "all 0.4s",
  },
  toggleButton: {
    position: "absolute",
    bottom: -Math.abs(theme.spacing(8)),
    right: theme.spacing(2),
    zIndex: 2000,
    transition: "all 0.4s",
  },
  toggleButtonOff: {
    bottom: "-500px",
  },
  extendedIcon: {
    marginRight: theme.spacing(1),
  },
}));

export default function ObserverUI({
  showFullCameraControls,
  setShowFullCameraControls,
}) {
  const classes = useStyles();
  const dispatch = useDispatch();

  // connect to observer side newCameraCommand to get global camera data on first connect,
  // send message to set active camera
  const { messages, sendMessage } = useCameraWebSocket(
    NEW_CAMERA_COMMAND_EVENT
  );

  // connect to CAM_HEARTBEAT, store current cam parameters in Redux state
  useCameraWebSocket(CAM_HEARTBEAT);
  const activeCamera = useSelector(selectActiveCamera);
  const initialCamHeartbeat = useSelector(selectInitialCamHeartbeatData);

  // use CAM_HEARTBEAT parameters only on initial app load to set activeCamera
  // keep camera params in local state otherwise
  useEffect(() => {
    const setInitialCamera = () => {
      dispatch(changeActiveCamera(initialCamHeartbeat));

      // send camera change command to set available settings options
      const payload = {
        camera: initialCamHeartbeat.camera,
        action: {
          name: COMMAND_STRINGS.cameraChangeCommand,
          value: initialCamHeartbeat.camera,
        },
      };
      sendMessage(payload);
    };

    // set initial camera state only if activeCamera is undefined
    if (activeCamera === null) {
      if (initialCamHeartbeat !== null) {
        setInitialCamera();
      }
    }
  }, [activeCamera, dispatch, initialCamHeartbeat, sendMessage]);

  return (
    <TopControlPanel
      showFullCameraControls={showFullCameraControls}
      setShowFullCameraControls={setShowFullCameraControls}
    />
  );
}
