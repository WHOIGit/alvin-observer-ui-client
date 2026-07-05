import { useDispatch, useSelector } from "react-redux";
import {
  useCameraList,
  useCameraSettings,
  useCommandReceipt,
  useRouterInputs,
  useRouterOutputs,
} from "../../hooks/useImagingClient";
import {
  changeCurrentCamData,
  setAllCameras,
  setRouterOutputs,
  setRouterInputs,
  changeCameraSettings,
  selectObserverSide,
} from "../camera-controls/cameraControlsSlice";

// Feeds the server's newCameraCommand traffic into Redux. The library splits
// the event's several message shapes into typed channels: configuration
// broadcasts (camera list, router topology, settings options) and command
// receipts, which resolve entries in the pending-ack queue.
export default function NewCameraCommandListener({ namespaceOverride = null }) {
  const dispatch = useDispatch();
  const observerSide = useSelector(selectObserverSide);
  const side = namespaceOverride || observerSide;

  useCameraSettings(side, (message) => dispatch(changeCurrentCamData(message)));
  useCameraList(side, (cameras) => dispatch(setAllCameras(cameras)));
  useRouterOutputs(side, (outputs) => dispatch(setRouterOutputs(outputs)));
  useRouterInputs(side, (inputs) => dispatch(setRouterInputs(inputs)));
  useCommandReceipt(side, (message) => dispatch(changeCameraSettings(message)));

  return null;
}
