import { createSlice, original } from "@reduxjs/toolkit";
import { isEqual } from "lodash";
import { createSelector } from "reselect";
import {
  COMMAND_STRINGS,
  VIDEO_STREAM_CONFIG,
  WS_SERVER_NAMESPACE_PORT,
  WS_SERVER_NAMESPACE_STARBOARD,
  WS_SERVER_NAMESPACE_PILOT,
} from "../../config.js";

// set default settings
const defaultObserverVideoSrc = VIDEO_STREAM_CONFIG.portObserverVideo;
const defaultObserverVideoSmallSrc = VIDEO_STREAM_CONFIG.portObserverSmallVideo;
const defaultRecordVideoSrc = VIDEO_STREAM_CONFIG.portRecordVideo;

const initialState = {
  observerSide: null, // P = Port, S = Starboard, PL = Pilot
  webSocketNamespace: WS_SERVER_NAMESPACE_PILOT,
  observerVideoSrc: defaultObserverVideoSrc,
  observerVideoSmallSrc: defaultObserverVideoSmallSrc,
  recordVideoSrc: defaultRecordVideoSrc,
  initialCamHeartbeat: null,
  activeCamera: null,
  camHeartbeatData: null,
  camHeartbeatDataPort: null, // observer specific heartbeat data for Pilot UI
  camHeartbeatDataStbd: null, // observer specific heartbeat data for Pilot UI
  recorderHeartbeatData: null,
  currentCamData: null,
  lastCommand: null,
  joystickStatus: null,
  recorderResponseError: false,
  videoSourceEnabled: true,
  exposureControlsEnabled: true,
  recordControlsEnabled: true,
  errorCameraChange: false,
  // array of commands
  commandsQueue: [],
  allCameras: [],
  routerOutputs: [],
  routerInputs: [],
  imageTransferAcomms: false,
  socketError: false,
};

const getCameraConfig = (cameraId, cameras) => {
  const cameraConfig = cameras.find((item) => item.camera === cameraId);
  return cameraConfig;
};

export const cameraControlsSlice = createSlice({
  name: "cameraControls",
  initialState: initialState,
  reducers: {
    setObserverSide: (state, action) => {
      state.observerSide = action.payload;
      if (action.payload === "P") {
        state.webSocketNamespace = WS_SERVER_NAMESPACE_PORT;
        state.observerVideoSrc = VIDEO_STREAM_CONFIG.portObserverVideo;
        state.observerVideoSmallSrc =
          VIDEO_STREAM_CONFIG.portObserverSmallVideo;
        state.recordVideoSrc = VIDEO_STREAM_CONFIG.portRecordVideo; //mjs-added-19apr2022
      }
      if (action.payload === "S") {
        state.webSocketNamespace = WS_SERVER_NAMESPACE_STARBOARD;
        state.observerVideoSrc = VIDEO_STREAM_CONFIG.stbdObserverVideo;
        state.observerVideoSmallSrc =
          VIDEO_STREAM_CONFIG.stbdObserverSmallVideo;
        state.recordVideoSrc = VIDEO_STREAM_CONFIG.stbdRecordVideo; //mjs-added-19apr2022
      }
    },
    changeActiveCamera: (state, action) => {
      const activeCamera = getCameraConfig(
        action.payload.camera,
        state.allCameras
      );
      state.activeCamera = activeCamera;
    },
    setLastCommand: (state, action) => {
      state.lastCommand = action.payload;
      state.lastCommand.action.name = action.payload.action.name;
      state.lastCommand.action.value = action.payload.action.value;
      state.lastCommand.status = "PENDING";
    },
    addCommandQueue: (state, action) => {
      state.commandsQueue = state.commandsQueue.concat(action.payload);
    },
    changeCameraSettings: (state, action) => {
      // need to check confirmation of successful command from WebSocket
      state.commandsQueue.forEach((element) => {
        if (action.payload.eventId === element.eventId) {
          // If websocket receipt returns OK, update the live settings
          if (action.payload.receipt.status === "OK") {
            state.errorCameraChange = false;
            // change the camera settings
            switch (element.action.name) {
              // change observer camera
              case COMMAND_STRINGS.cameraChangeCommand:
                const activeCamera = getCameraConfig(
                  element.action.value,
                  state.allCameras
                );
                state.activeCamera = activeCamera;
                break;
              // change focus mode
              case COMMAND_STRINGS.focusModeCommand:
                state.currentCamData.currentSettings.focus_mode =
                  element.action.value;
                break;
              // change shutter mode
              case COMMAND_STRINGS.shutterModeCommand:
                state.currentCamData.currentSettings.SHU = element.action.value;
                break;
              // change iris mode
              case COMMAND_STRINGS.irisModeCommand:
                state.currentCamData.currentSettings.IRS = element.action.value;
                break;
              // change iso mode
              case COMMAND_STRINGS.isoModeCommand:
                state.currentCamData.currentSettings.ISO = element.action.value;
                break;
              // change exposure mode
              case COMMAND_STRINGS.exposureModeCommand:
                state.currentCamData.currentSettings.exposure_mode =
                  element.action.value;
                break;
              default:
            }
          } else {
            console.log("ERROR Received from AIS");
            state.errorCameraChange = true;
          }
        }
        // remove command from queue
        state.commandsQueue = state.commandsQueue.filter(
          (item) => item.eventId !== action.payload.eventId
        );
      });
    },
    changeCamHeartbeat: (state, action) => {
      if (state.initialCamHeartbeat === null) {
        state.initialCamHeartbeat = action.payload;
      }

      // get the original state to check Heartbeat data
      const currentState = original(state);
      const camHeartbeatData = action.payload;
      delete camHeartbeatData.eventId;
      delete camHeartbeatData.timestamp;

      if (isEqual(currentState.camHeartbeatData, camHeartbeatData)) {
        return state;
      }

      state.camHeartbeatData = action.payload;
    },
    changeCamHeartbeatPort: (state, action) => {
      // get the original state to check Heartbeat data
      const currentState = original(state);
      const camHeartbeatDataPort = action.payload;
      delete camHeartbeatDataPort.eventId;
      delete camHeartbeatDataPort.timestamp;

      if (isEqual(currentState.camHeartbeatDataPort, camHeartbeatDataPort)) {
        return state;
      }
      state.camHeartbeatDataPort = action.payload;
    },
    changeCamHeartbeatStbd: (state, action) => {
      // get the original state to check Heartbeat data
      const currentState = original(state);
      const camHeartbeatDataStbd = action.payload;
      delete camHeartbeatDataStbd.eventId;
      delete camHeartbeatDataStbd.timestamp;

      if (isEqual(currentState.camHeartbeatDataStbd, camHeartbeatDataStbd)) {
        return state;
      }
      state.camHeartbeatDataStbd = action.payload;
    },
    changeRecorderHeartbeat: (state, action) => {
      // get the original state to check Heartbeat data
      const currentState = original(state);
      const data = action.payload;
      delete data.eventId;
      //delete data.timestamp;
      if (isEqual(currentState.recorderHeartbeatData, data)) {
        return state;
      }
      state.recorderHeartbeatData = data;
    },
    changeCurrentCamData: (state, action) => {
      state.currentCamData = {};
      state.currentCamData.IRS = action.payload.IRS;
      state.currentCamData.ISO = action.payload.ISO;
      state.currentCamData.SHU = action.payload.SHU;
      state.currentCamData.currentSettings = action.payload.current_settings;
    },
    setJoystickStatus: (state, action) => {
      state.joystickStatus = action.payload;
    },
    setRecorderError: (state, action) => {
      state.recorderResponseError = action.payload;
    },
    setVideoSourceEnabled: (state, action) => {
      state.videoSourceEnabled = action.payload;
    },
    setExposureControlsEnabled: (state, action) => {
      state.exposureControlsEnabled = action.payload;
    },
    setRecordControlsEnabled: (state, action) => {
      state.recordControlsEnabled = action.payload;
    },
    setErrorCameraChange: (state, action) => {
      state.errorCameraChange = action.payload;
    },
    setAllCameras: (state, action) => {
      state.allCameras = action.payload;
    },
    setRouterOutputs: (state, action) => {
      state.routerOutputs = action.payload;
    },
    setRouterInputs: (state, action) => {
      state.routerInputs = action.payload;
    },
    setImageTransferAcomms: (state, action) => {
      state.imageTransferAcomms = action.payload;
    },
    setSocketError: (state, action) => {
      state.socketError = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  changeActiveCamera,
  changeCameraSettings,
  changeCamHeartbeat,
  changeCamHeartbeatPort,
  changeCamHeartbeatStbd,
  changeRecorderHeartbeat,
  changeCurrentCamData,
  setLastCommand,
  setObserverSide,
  setJoystickStatus,
  setRecorderError,
  setVideoSourceEnabled,
  addCommandQueue,
  setExposureControlsEnabled,
  setRecordControlsEnabled,
  setErrorCameraChange,
  setAllCameras,
  setRouterOutputs,
  setRouterInputs,
  setImageTransferAcomms,
  setSocketError,
} = cameraControlsSlice.actions;

export default cameraControlsSlice.reducer;

// Selector functions
// return only the Active camera id currently selected
export const selectActiveCamera = (state) => {
  if (state.cameraControls.activeCamera) {
    return state.cameraControls.activeCamera.camera;
  } else {
    return null;
  }
};

// return all the Active camera config values
export const selectActiveCameraConfig = (state) =>
  state.cameraControls.activeCamera;

// return the current Observer Side
export const selectObserverSide = (state) => state.cameraControls.observerSide;

// return the current Web Socket server namespace (port/stbd/pilot)
export const selectWebSocketNamespace = (state) =>
  state.cameraControls.webSocketNamespace;

// use createSelector to create memoized selector
// return the current CamHeartbeat data
export const selectCamHeartbeatData = createSelector(
  (state) => state.cameraControls.camHeartbeatData,
  (item) => item
);

// return the Port CamHeartbeat data
export const selectCamHeartbeatDataPort = (state) =>
  state.cameraControls.camHeartbeatDataPort;

// return the Starboard CamHeartbeat data
export const selectCamHeartbeatDataStbd = (state) =>
  state.cameraControls.camHeartbeatDataStbd;

// return the initial cached CamHeartbeat data
export const selectInitialCamHeartbeatData = (state) =>
  state.cameraControls.initialCamHeartbeat;

// return the current RecorderHeartbeat data
//export const selectRecorderHeartbeatData = (state) =>
//  state.cameraControls.recorderHeartbeatData;

// use createSelector to create memoized selector
// return the current RecorderHeartbeat data
export const selectRecorderHeartbeatData = createSelector(
  (state) => state.cameraControls.recorderHeartbeatData,
  (item) => item
);

// return the current Camera data the socket returns on a camera change
export const selectCurrentCamData = (state) =>
  state.cameraControls.currentCamData;

// return the current joystick status
export const selectJoystickStatus = (state) =>
  state.cameraControls.joystickStatus;

// return the error status of last Recorder response
export const selectRecorderResponseError = (state) =>
  state.cameraControls.recorderResponseError;

// return if Video Source select should be enabled/disabled
export const selectVideoSourceEnabled = (state) =>
  state.cameraControls.videoSourceEnabled;

// return if Exposure controls should be enabled/disabled
export const selectExposureControlsEnabled = (state) =>
  state.cameraControls.exposureControlsEnabled;

// return if Record Button should be enabled/disabled
export const selectRecordControlsEnabled = (state) =>
  state.cameraControls.recordControlsEnabled;

// return error disable
export const selectErrorCameraChange = (state) =>
  state.cameraControls.errorCameraChange;

// return initial camera config values supplied by AIS
export const selectAllCameras = createSelector(
  (state) => state.cameraControls.allCameras,
  (item) => item
);

// return initial router output values supplied by AIS
export const selectRouterOutputs = createSelector(
  (state) => state.cameraControls.routerOutputs,
  (item) => item
);

// return initial router input values supplied by AIS
export const selectRouterInputs = createSelector(
  (state) => state.cameraControls.routerInputs,
  (item) => item
);

// return error disable
export const selectImageTransferAcomms = (state) =>
  state.cameraControls.imageTransferAcomms;

// return socket error status
export const selectSocketError = (state) => state.cameraControls.socketError;

// return last command
export const selectLastCommand = (state) => state.cameraControls.lastCommand;
