import { useDispatch, useSelector } from "react-redux";
import { useCommandSent } from "../../hooks/useImagingClient";
import {
  addCommandQueue,
  selectObserverSide,
  setLastCommand,
} from "../camera-controls/cameraControlsSlice";

// Mirrors every outgoing camera command into Redux (lastCommand plus the
// pending-acknowledgment queue). The library invokes onCommandSent
// synchronously before the wire emit, so the queue entry always exists by
// the time the server's receipt can arrive. Renders nothing.
export default function CommandStateListener() {
  const dispatch = useDispatch();
  const observerSide = useSelector(selectObserverSide);

  useCommandSent(observerSide, (payload) => {
    dispatch(setLastCommand(payload));
    dispatch(addCommandQueue(payload));
  });

  return null;
}
