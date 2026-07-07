import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import TopControlPanel from "./TopControlPanel";
import { useObservedStation } from "../camera-controls/ObservedCameraProvider";
import {
  changeActiveCamera,
  selectActiveCamera,
  selectInitialCamHeartbeatData,
} from "../camera-controls/cameraControlsSlice";
import CamHeartbeatListener from "../listeners/CamHeartbeatListener";
import NewCameraCommandListener from "../listeners/NewCameraCommandListener";
import RecorderHeartbeatListener from "../listeners/RecorderHeartbeatListener";
import ConnectionStatusListener from "../listeners/ConnectionStatusListener";

export default function ObserverUI({
  showFullCameraControls,
  setShowFullCameraControls,
}) {
  const dispatch = useDispatch();

  const station = useObservedStation();

  const activeCamera = useSelector(selectActiveCamera);
  const initialCamHeartbeat = useSelector(selectInitialCamHeartbeatData);

  // use CAM_HEARTBEAT parameters only on initial app load to set activeCamera
  // keep camera params in local state otherwise
  useEffect(() => {
    const setInitialCamera = () => {
      dispatch(changeActiveCamera(initialCamHeartbeat));

      // send camera change command to set available settings options
      station.selectCamera(initialCamHeartbeat.camera, {
        activeCamera: initialCamHeartbeat.camera,
      });
    };

    // set initial camera state only if activeCamera is undefined
    if (activeCamera === null) {
      if (initialCamHeartbeat !== null) {
        setInitialCamera();
      }
    }
  }, [activeCamera, dispatch, station, initialCamHeartbeat]);

  return (
    <>
      <CamHeartbeatListener />
      <NewCameraCommandListener />
      <RecorderHeartbeatListener />
      <ConnectionStatusListener />

      <TopControlPanel
        showFullCameraControls={showFullCameraControls}
        setShowFullCameraControls={setShowFullCameraControls}
      />
    </>
  );
}
