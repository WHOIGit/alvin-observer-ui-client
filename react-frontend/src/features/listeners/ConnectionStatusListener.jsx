import { useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSocket } from "../../hooks/useSocket";
import { getObserverInfo } from "../../utils/observerSide";
import { selectObserverSide } from "../camera-controls/cameraControlsSlice";
import {
  addSystemMessage,
  dismissSystemMessage,
} from "../system-messages/systemMessagesSlice";

const SIDE_LABELS = {
  P: "Port",
  S: "Starboard",
  PL: "Pilot",
};

// Watches the imaging-server socket for a given observer side and mirrors its
// connection state into the global system-notifications store. A dropped link
// therefore surfaces in the same notification bell as v1.5 SystemMessage
// alerts, instead of failing silently. Renders nothing.
export default function ConnectionStatusListener({ namespaceOverride = null }) {
  const dispatch = useDispatch();
  const observerSide = useSelector(selectObserverSide);
  const namespaceInfo = useMemo(
    () => getObserverInfo(namespaceOverride || observerSide),
    [namespaceOverride, observerSide]
  );
  const namespacePath = namespaceInfo.namespacePath;
  const socket = useSocket(namespacePath);

  // Refs so the event handlers can track transitions without re-subscribing:
  // only post a "lost connection" once per outage, and only post a recovery
  // notice after an actual drop (not on the very first connect).
  const lossActiveRef = useRef(false);
  const everConnectedRef = useRef(false);

  useEffect(() => {
    const label = SIDE_LABELS[namespaceInfo.observerSide] || namespaceInfo.observerSide;
    const lossId = `connection-loss:${namespacePath}`;

    const reportLoss = () => {
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
    };

    const reportConnected = () => {
      everConnectedRef.current = true;
      if (!lossActiveRef.current) return;
      lossActiveRef.current = false;
      dispatch(dismissSystemMessage(lossId));
      dispatch(
        addSystemMessage({
          correlation_id: `connection-restored:${namespacePath}`,
          message: `Reconnected to imaging server (${label})`,
          level: "INFO",
          source: "connection",
          ttl_seconds: 10,
        })
      );
    };

    socket.on("connect", reportConnected);
    socket.on("disconnect", reportLoss);
    socket.on("connect_error", reportLoss);

    // The pooled socket may already have connected before this listener
    // mounted (e.g. a side switch); reflect its current state immediately.
    if (socket.connected) {
      everConnectedRef.current = true;
    }

    return () => {
      socket.off("connect", reportConnected);
      socket.off("disconnect", reportLoss);
      socket.off("connect_error", reportLoss);
    };
  }, [socket, namespacePath, namespaceInfo.observerSide, dispatch]);

  return null;
}
