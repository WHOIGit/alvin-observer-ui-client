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
  changeCurrentCamData,
  setAllCameras,
  setRouterOutputs,
  setRouterInputs,
  selectObserverSide,
} from "../camera-controls/cameraControlsSlice";

// Feeds the server's newCameraCommand traffic into Redux. The library splits
// the event into typed channels: configuration broadcasts (camera list,
// router topology, settings options) and settled command results, which the
// library has already correlated to their receipts by eventId.
export default function NewCameraCommandListener({ namespaceOverride = null }) {
  const dispatch = useDispatch();
  const observerSide = useSelector(selectObserverSide);
  const side = namespaceOverride || observerSide;

  useCameraSettings(side, (message) => dispatch(changeCurrentCamData(message)));
  useCameraList(side, (cameras) => dispatch(setAllCameras(cameras)));
  useRouterOutputs(side, (outputs) => dispatch(setRouterOutputs(outputs)));
  useRouterInputs(side, (inputs) => dispatch(setRouterInputs(inputs)));
  useCommandResult(side, (result) => dispatch(applyCommandResult(result)));

  return null;
}
