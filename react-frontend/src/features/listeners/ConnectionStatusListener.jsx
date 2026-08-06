import { useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useConnectionStatus } from "../../hooks/useImagingClient";
import { getStationInfo } from "../../lib/imaging-client";
import { selectOwnStationId } from "../camera-controls/cameraControlsSlice";
import {
  addSystemMessage,
  dismissSystemMessage,
} from "../system-messages/systemMessagesSlice";

const STATION_LABELS = {
  P: "Port",
  S: "Starboard",
  PL: "Pilot",
};

// Watches a station's imaging-server connection and mirrors its state into
// the global system-notifications store. A dropped link therefore surfaces
// in the same notification bell as v1.5 SystemMessage alerts, instead of
// failing silently. Renders nothing.
export default function ConnectionStatusListener({ station = null }) {
  const dispatch = useDispatch();
  const ownStationId = useSelector(selectOwnStationId);
  const stationInfo = useMemo(
    () => getStationInfo(station || ownStationId),
    [station, ownStationId]
  );

  // Refs so the handler can track transitions without re-subscribing: only
  // post a "lost connection" once per outage, and only post a recovery
  // notice after an actual drop (not on the very first connect — the
  // library replays the current state when the subscription attaches).
  const lossActiveRef = useRef(false);
  const everConnectedRef = useRef(false);

  useConnectionStatus(station || ownStationId, ({ status }) => {
    const label =
      STATION_LABELS[stationInfo.stationId] || stationInfo.stationId;
    const lossId = `connection-loss:${stationInfo.stationId}`;

    if (status === "connected") {
      const wasLost = lossActiveRef.current;
      everConnectedRef.current = true;
      if (!wasLost) return;
      lossActiveRef.current = false;
      dispatch(dismissSystemMessage(lossId));
      dispatch(
        addSystemMessage({
          correlation_id: `connection-restored:${stationInfo.stationId}`,
          message: `Reconnected to imaging server (${label})`,
          level: "INFO",
          source: "connection",
          ttl_seconds: 10,
        })
      );
      return;
    }

    // "disconnected" or "error"
    if (lossActiveRef.current) return;
    lossActiveRef.current = true;
    dispatch(
      addSystemMessage({
        correlation_id: lossId,
        message: everConnectedRef.current
          ? `Lost connection to imaging server (${label})`
          : `Unable to reach imaging server (${label})`,
        level: "CRITICAL",
        source: "connection",
        sticky: true,
      })
    );
  });

  return null;
}
