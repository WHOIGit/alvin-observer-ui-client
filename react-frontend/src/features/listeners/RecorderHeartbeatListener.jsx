import { useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { isEqual } from "lodash";
import { useRecorderHeartbeat } from "../../hooks/useImagingClient";
import {
  changeRecorderHeartbeat,
  selectOwnStationId,
} from "../camera-controls/cameraControlsSlice";

export default function RecorderHeartbeatListener() {
  const dispatch = useDispatch();
  const ownStationId = useSelector(selectOwnStationId);

  // The store ignores the per-message eventId, so skip the dispatch when
  // nothing else changed — a no-op dispatch still re-runs every subscribed
  // selector at heartbeat rate.
  const lastHeartbeatRef = useRef(null);

  const handleMessage = useCallback(
    (message) => {
      const { eventId, ...comparable } = message;
      if (isEqual(lastHeartbeatRef.current, comparable)) return;
      lastHeartbeatRef.current = comparable;
      dispatch(changeRecorderHeartbeat(message));
    },
    [dispatch]
  );

  useRecorderHeartbeat(ownStationId, handleMessage);

  return null;
}
