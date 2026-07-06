import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRecorderHeartbeat } from "../../hooks/useImagingClient";
import {
  changeRecorderHeartbeat,
  selectObserverSide,
} from "../camera-controls/cameraControlsSlice";

export default function RecorderHeartbeatListener() {
  const dispatch = useDispatch();
  const observerSide = useSelector(selectObserverSide);

  const handleMessage = useCallback(
    (message) => {
      dispatch(changeRecorderHeartbeat(message));
    },
    [dispatch]
  );

  useRecorderHeartbeat(observerSide, handleMessage);

  return null;
}
