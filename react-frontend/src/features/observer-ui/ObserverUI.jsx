import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import TopControlPanel from "./TopControlPanel";
import { useCameraCommandEmitter } from "../../hooks/useCameraCommandEmitter";
import {
  changeActiveCamera,
  selectActiveCamera,
  selectInitialCamHeartbeatData,
  selectObserverSide,
} from "../camera-controls/cameraControlsSlice";
import CamHeartbeatListener from "../listeners/CamHeartbeatListener";
import NewCameraCommandListener from "../listeners/NewCameraCommandListener";
import RecorderHeartbeatListener from "../listeners/RecorderHeartbeatListener";
import { COMMAND_STRINGS } from "../../config";

export default function ObserverUI({
  showFullCameraControls,
  setShowFullCameraControls,
}) {
  const dispatch = useDispatch();

  // emitter for camera commands on the user's namespace
  const observerSide = useSelector(selectObserverSide);
  const { emit } = useCameraCommandEmitter({
    observerSide,
  });

  const activeCamera = useSelector(selectActiveCamera);
  const initialCamHeartbeat = useSelector(selectInitialCamHeartbeatData);

  // use CAM_HEARTBEAT parameters only on initial app load to set activeCamera
  // keep camera params in local state otherwise
  useEffect(() => {
    const setInitialCamera = () => {
      dispatch(changeActiveCamera(initialCamHeartbeat));

      // send camera change command to set available settings options
      void emit({
        camera: initialCamHeartbeat.camera,
        action: {
          name: COMMAND_STRINGS.cameraChangeCommand,
          value: initialCamHeartbeat.camera,
        },
      });
    };

    // set initial camera state only if activeCamera is undefined
    if (activeCamera === null) {
      if (initialCamHeartbeat !== null) {
        setInitialCamera();
      }
    }
  }, [activeCamera, dispatch, emit, initialCamHeartbeat]);

  return (
    <>
      <CamHeartbeatListener />
      <NewCameraCommandListener />
      <RecorderHeartbeatListener />

      <TopControlPanel
        showFullCameraControls={showFullCameraControls}
        setShowFullCameraControls={setShowFullCameraControls}
      />
    </>
  );
}
