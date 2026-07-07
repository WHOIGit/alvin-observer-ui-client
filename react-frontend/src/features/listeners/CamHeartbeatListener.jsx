import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useCamHeartbeat } from "../../hooks/useImagingClient";
import { getStationInfo } from "../../lib/imaging-client";
import {
  selectOwnStationId,
  storeCamHeartbeat,
} from "../camera-controls/cameraControlsSlice";

// Ingests one station's CamHeartbeat into the station-keyed Redux map.
// Defaults to the console's own station; the pilot mounts extra instances
// for the observer stations it mirrors.
export default function CamHeartbeatListener({ station = null }) {
  const dispatch = useDispatch();
  const ownStationId = useSelector(selectOwnStationId);
  const stationId = getStationInfo(station || ownStationId).stationId;

  const handleMessage = useCallback(
    (heartbeat) => {
      dispatch(storeCamHeartbeat({ stationId, heartbeat }));
    },
    [dispatch, stationId]
  );

  useCamHeartbeat(stationId, handleMessage);

  return null;
}
