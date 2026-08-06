import { useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { isEqual } from "lodash";
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

  // The store ignores eventId/timestamp churn, so skip the dispatch entirely
  // when nothing else changed — a no-op dispatch still re-runs every
  // subscribed selector at heartbeat rate.
  const lastHeartbeatRef = useRef(null);

  const handleMessage = useCallback(
    (heartbeat) => {
      const { eventId, timestamp, ...comparable } = heartbeat;
      if (isEqual(lastHeartbeatRef.current, comparable)) return;
      lastHeartbeatRef.current = comparable;
      dispatch(storeCamHeartbeat({ stationId, heartbeat }));
    },
    [dispatch, stationId]
  );

  useCamHeartbeat(stationId, handleMessage);

  return null;
}
