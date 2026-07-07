import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRecorderHeartbeat } from "../../hooks/useImagingClient";
import {
  changeRecorderHeartbeat,
  selectOwnStationId,
} from "../camera-controls/cameraControlsSlice";

export default function RecorderHeartbeatListener() {
  const dispatch = useDispatch();
  const ownStationId = useSelector(selectOwnStationId);

  const handleMessage = useCallback(
    (message) => {
      dispatch(changeRecorderHeartbeat(message));
    },
    [dispatch]
  );

  useRecorderHeartbeat(ownStationId, handleMessage);

  return null;
}
