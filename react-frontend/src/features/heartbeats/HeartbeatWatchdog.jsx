import React, { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSocketListener } from "../../hooks/useSocket";
import { getObserverInfo } from "../../utils/observerSide";
import {
  selectObserverSide,
  setSocketError,
} from "../camera-controls/cameraControlsSlice";
import {
  addSystemMessage,
  dismissSystemMessage,
} from "../system-messages/systemMessagesSlice";
import { HEARTBEAT_STREAMS, evaluateStaleStreams } from "./streams";

const CHECK_INTERVAL_MS = 5000;
const STALE_ID_PREFIX = "heartbeat-stale-";

const staleMessageId = (key) => `${STALE_ID_PREFIX}${key}`;

// Subscribes to one heartbeat event and stamps the time each message arrives.
// Renders nothing; one is mounted per watched stream.
function StreamSubscriber({ stream, namespace, onSeen }) {
  const handleMessage = useCallback(() => onSeen(stream.key), [onSeen, stream.key]);
  useSocketListener(namespace, stream.event, handleMessage);
  return null;
}

// Watches every heartbeat stream for liveness. When a stream stops updating it
// raises a single WARN/ERROR system message (which both lands in the
// notification bar and lights up the matching control via AlertHighlight) and
// clears it on recovery. Losing the imaging-server heartbeats (camera/recorder)
// additionally drives the connection-error chip. Renders only its subscribers.
export default function HeartbeatWatchdog() {
  const dispatch = useDispatch();
  const observerSide = useSelector(selectObserverSide);
  const sideNamespacePath = getObserverInfo(observerSide).namespacePath;

  const lastSeenRef = useRef({});
  const flaggedRef = useRef(new Set());

  const handleSeen = useCallback((key) => {
    lastSeenRef.current[key] = Date.now();
  }, []);

  useEffect(() => {
    const tick = () => {
      const stale = evaluateStaleStreams(lastSeenRef.current, Date.now());
      const flagged = flaggedRef.current;

      HEARTBEAT_STREAMS.forEach((stream) => {
        const isStale = Boolean(stale[stream.key]);
        const wasFlagged = flagged.has(stream.key);

        if (isStale && !wasFlagged) {
          dispatch(
            addSystemMessage({
              correlation_id: staleMessageId(stream.key),
              timestamp: new Date().toISOString(),
              message: `${stream.label} heartbeat lost (no update in ${Math.round(
                stream.staleMs / 1000
              )}s)`,
              level: stream.level,
              source: stream.source,
            })
          );
          flagged.add(stream.key);
        } else if (!isStale && wasFlagged) {
          dispatch(dismissSystemMessage(staleMessageId(stream.key)));
          flagged.delete(stream.key);
        }
      });

      // Revive the otherwise-dead imaging connection chip when the imaging
      // server's heartbeats have gone quiet.
      dispatch(setSocketError(Boolean(stale.camera || stale.recorder)));
    };

    const intervalId = window.setInterval(tick, CHECK_INTERVAL_MS);
    tick();
    return () => window.clearInterval(intervalId);
  }, [dispatch]);

  return (
    <>
      {HEARTBEAT_STREAMS.map((stream) => (
        <StreamSubscriber
          key={stream.key}
          stream={stream}
          namespace={
            stream.namespace === "side" ? sideNamespacePath : stream.namespace
          }
          onSeen={handleSeen}
        />
      ))}
    </>
  );
}
