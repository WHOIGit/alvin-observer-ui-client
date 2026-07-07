import { createSlice, original } from "@reduxjs/toolkit";
import { isEqual } from "lodash";
import { createSelector } from "reselect";
import { VIDEO_STREAM_CONFIG } from "../../config.js";
import { COMMAND_KINDS } from "../../lib/imaging-client";

// set default settings
const defaultObserverVideoSrc =
  window.PILOT_MODE === true
    ? VIDEO_STREAM_CONFIG.pilotVideo
    : VIDEO_STREAM_CONFIG.portObserverVideo;
const defaultRecordVideoSrc =
  window.PILOT_MODE === true ? null : VIDEO_STREAM_CONFIG.portRecordVideo;

const initialState = {
  observerSide: window.PILOT_MODE === true ? "PL" : null, // P = Port, S = Starboard, PL = Pilot
  observerVideoSrc: defaultObserverVideoSrc,
  recordVideoSrc: defaultRecordVideoSrc,
  initialCamHeartbeat: null,
  activeCamera: null,
  camHeartbeatData: null,
  camHeartbeatDataPort: null, // observer specific heartbeat data for Pilot UI
  camHeartbeatDataStbd: null, // observer specific heartbeat data for Pilot UI
  recorderHeartbeatData: null,
  currentCamData: null,
  joystickStatus: null,
  recorderResponseError: false,
  videoSourceEnabled: true,
  exposureControlsEnabled: true,
  recordControlsEnabled: true,
  allCameras: [],
  routerOutputs: [],
  routerInputs: [],
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
        state.observerVideoSrc = VIDEO_STREAM_CONFIG.portObserverVideo;
        if (window.PILOT_MODE !== true) {
          state.recordVideoSrc = VIDEO_STREAM_CONFIG.portRecordVideo; //mjs-added-19apr2022
        }
      }
      if (action.payload === "S") {
        state.observerVideoSrc = VIDEO_STREAM_CONFIG.stbdObserverVideo;
        if (window.PILOT_MODE !== true) {
          state.recordVideoSrc = VIDEO_STREAM_CONFIG.stbdRecordVideo; //mjs-added-19apr2022
        }
      }
    },
    changeActiveCamera: (state, action) => {
      const activeCamera = getCameraConfig(
        action.payload.camera,
        state.allCameras
      );
      state.activeCamera = activeCamera;
    },
    // Applies a settled command's outcome to the live camera state. The
    // imaging-client correlates receipts to commands and reports them by
    // semantic kind; failed commands leave state untouched.
    applyCommandResult: (state, action) => {
      const { kind, value, isOk } = action.payload;
      if (!isOk) {
        console.log("ERROR Received from AIS");
        return;
      }
      // A result can beat the first settings broadcast, in which case there
      // is no currentSettings object to update yet.
      const currentSettings = state.currentCamData?.currentSettings;
      switch (kind) {
        case COMMAND_KINDS.SELECT_CAMERA:
          state.activeCamera = getCameraConfig(value, state.allCameras);
          break;
        case COMMAND_KINDS.SET_FOCUS_MODE:
          if (currentSettings) currentSettings.focus_mode = value;
          break;
        case COMMAND_KINDS.SET_SHUTTER:
          if (currentSettings) currentSettings.shu = value;
          break;
        case COMMAND_KINDS.SET_IRIS:
          if (currentSettings) currentSettings.irs = value;
          break;
        case COMMAND_KINDS.SET_ISO:
          if (currentSettings) currentSettings.iso = value;
          break;
        case COMMAND_KINDS.SET_EXPOSURE_MODE:
          if (currentSettings) currentSettings.exposure = value;
          break;
        default:
      }
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
    setAllCameras: (state, action) => {
      state.allCameras = action.payload;
    },
    setRouterOutputs: (state, action) => {
      state.routerOutputs = action.payload;
    },
    setRouterInputs: (state, action) => {
      state.routerInputs = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  changeActiveCamera,
  applyCommandResult,
  changeCamHeartbeat,
  changeCamHeartbeatPort,
  changeCamHeartbeatStbd,
  changeRecorderHeartbeat,
  changeCurrentCamData,
  setObserverSide,
  setJoystickStatus,
  setRecorderError,
  setVideoSourceEnabled,
  setExposureControlsEnabled,
  setRecordControlsEnabled,
  setAllCameras,
  setRouterOutputs,
  setRouterInputs,
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

// return socket error status

// return last command
