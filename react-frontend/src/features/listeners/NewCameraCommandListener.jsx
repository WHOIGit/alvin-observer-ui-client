import { useDispatch, useSelector } from "react-redux";
import {
  useCameraList,
  useCameraSettings,
  useCommandResult,
  useRouterInputs,
  useRouterOutputs,
} from "../../hooks/useImagingClient";
import {
  applyCommandResult,
  commandResultAppliesToState,
  changeCurrentCamData,
  setAllCameras,
  setRouterOutputs,
  setRouterInputs,
  selectOwnStationId,
} from "../camera-controls/cameraControlsSlice";

// Feeds the server's newCameraCommand traffic into Redux. The library splits
// the event into typed channels: configuration broadcasts (camera list,
// router topology, settings options) and settled command results, which the
// library has already correlated to their receipts by eventId.
export default function NewCameraCommandListener({ station = null }) {
  const dispatch = useDispatch();
  const ownStationId = useSelector(selectOwnStationId);
  const stationId = station || ownStationId;

  useCameraSettings(stationId, (message) => dispatch(changeCurrentCamData(message)));
  useCameraList(stationId, (cameras) => dispatch(setAllCameras(cameras)));
  useRouterOutputs(stationId, (outputs) => dispatch(setRouterOutputs(outputs)));
  useRouterInputs(stationId, (inputs) => dispatch(setRouterInputs(inputs)));
  useCommandResult(
    stationId,
    (result) => dispatch(applyCommandResult(result)),
    commandResultAppliesToState
  );

  return null;
}
