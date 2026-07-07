import React from "react";
import TopControlPanel from "./TopControlPanel";
import { useObservedStation } from "../camera-controls/ObservedCameraProvider";
import { useInitialCameraSelection } from "../camera-controls/useInitialCameraSelection";
import CamHeartbeatListener from "../listeners/CamHeartbeatListener";
import NewCameraCommandListener from "../listeners/NewCameraCommandListener";
import RecorderHeartbeatListener from "../listeners/RecorderHeartbeatListener";
import ConnectionStatusListener from "../listeners/ConnectionStatusListener";

export default function ObserverUI({
  showFullCameraControls,
  setShowFullCameraControls,
}) {
  const station = useObservedStation();
  useInitialCameraSelection(station);

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
