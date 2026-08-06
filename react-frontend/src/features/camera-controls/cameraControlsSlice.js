import { createSlice, original } from "@reduxjs/toolkit";
import { isEqual } from "lodash";
import { createSelector } from "reselect";
import { VIDEO_STREAM_CONFIG } from "../../config.js";
import { COMMAND_KINDS, STATIONS } from "../../lib/imaging-client";

// set default settings
const defaultObserverVideoSrc =
  window.PILOT_MODE === true
    ? VIDEO_STREAM_CONFIG.pilotVideo
    : VIDEO_STREAM_CONFIG.portObserverVideo;
const defaultRecordVideoSrc =
  window.PILOT_MODE === true ? null : VIDEO_STREAM_CONFIG.portRecordVideo;

const initialState = {
  ownStationId: window.PILOT_MODE === true ? STATIONS.PILOT : null,
  observerVideoSrc: defaultObserverVideoSrc,
  recordVideoSrc: defaultRecordVideoSrc,
  // CamHeartbeats keyed by StationId. An observer console fills only its own
  // entry; the pilot fills all three.
  initialCamHeartbeats: {},
  camHeartbeats: {},
  activeCamera: null,
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

// The currentSettings field each mirrored settings kind writes when its
// receipt confirms. applyCommandResult and the delivery filter both derive
// from this map, so a kind is mirrored exactly when it has an entry here
// (SELECT_CAMERA is the one non-settings mirrored kind).
const SETTINGS_FIELD_BY_KIND = {
  [COMMAND_KINDS.SET_FOCUS_MODE]: "focus_mode",
  [COMMAND_KINDS.SET_SHUTTER]: "shu",
  [COMMAND_KINDS.SET_IRIS]: "irs",
  [COMMAND_KINDS.SET_ISO]: "iso",
  [COMMAND_KINDS.SET_EXPOSURE_MODE]: "exposure",
};

const MIRRORED_COMMAND_KINDS = new Set([
  COMMAND_KINDS.SELECT_CAMERA,
  ...Object.keys(SETTINGS_FIELD_BY_KIND),
]);

// Predicate for Station.onCommandResult: deliver the outcomes the reducer
// mirrors into state, plus every failure so it gets logged. Successful
// high-frequency receipts — pan/tilt (10 Hz), focus, zoom, still capture —
// never reach the store at all.
export const commandResultAppliesToState = (result) =>
  MIRRORED_COMMAND_KINDS.has(result?.kind) || result?.isOk === false;

export const cameraControlsSlice = createSlice({
  name: "cameraControls",
  initialState: initialState,
  reducers: {
    setOwnStationId: (state, action) => {
      state.ownStationId = action.payload;
      if (action.payload === STATIONS.PORT) {
        state.observerVideoSrc = VIDEO_STREAM_CONFIG.portObserverVideo;
        if (window.PILOT_MODE !== true) {
          state.recordVideoSrc = VIDEO_STREAM_CONFIG.portRecordVideo; //mjs-added-19apr2022
        }
      }
      if (action.payload === STATIONS.STARBOARD) {
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
        console.log("ERROR Received from AIS", kind, action.payload.receipt);
        return;
      }
      if (kind === COMMAND_KINDS.SELECT_CAMERA) {
        // The result can beat the camera_array broadcast; keep the previous
        // active camera rather than clobbering it with undefined.
        const activeCamera = getCameraConfig(value, state.allCameras);
        if (activeCamera) state.activeCamera = activeCamera;
        return;
      }
      // A result can beat the first settings broadcast, in which case there
      // is no currentSettings object to update yet.
      const field = SETTINGS_FIELD_BY_KIND[kind];
      const currentSettings = state.currentCamData?.currentSettings;
      if (field && currentSettings) {
        currentSettings[field] = value;
      }
    },
    // Stores a station's latest heartbeat. eventId/timestamp churn on every
    // message, so they're stripped — without mutating the action, which
    // Immer does not draft — before the change check.
    storeCamHeartbeat: (state, action) => {
      const { stationId } = action.payload;
      const { eventId, timestamp, ...heartbeat } = action.payload.heartbeat;

      if (!state.initialCamHeartbeats[stationId]) {
        state.initialCamHeartbeats[stationId] = heartbeat;
      }

      const currentState = original(state);
      if (isEqual(currentState.camHeartbeats[stationId], heartbeat)) {
        return state;
      }
      state.camHeartbeats[stationId] = heartbeat;
    },
    changeRecorderHeartbeat: (state, action) => {
      // get the original state to check Heartbeat data
      const currentState = original(state);
      // Strip the per-message eventId without mutating the action.
      const { eventId, ...data } = action.payload;
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
  storeCamHeartbeat,
  changeRecorderHeartbeat,
  changeCurrentCamData,
  setOwnStationId,
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

// return this console's own StationId
export const selectOwnStationId = (state) => state.cameraControls.ownStationId;

// return a specific station's latest CamHeartbeat (null before one arrives)
export const selectCamHeartbeatFor = (state, stationId) =>
  state.cameraControls.camHeartbeats[stationId] ?? null;

// return the own station's current CamHeartbeat data
export const selectCamHeartbeatData = (state) =>
  selectCamHeartbeatFor(state, state.cameraControls.ownStationId);

// return the initial cached CamHeartbeat for the own station
export const selectInitialCamHeartbeatData = (state) =>
  state.cameraControls.initialCamHeartbeats[
    state.cameraControls.ownStationId
  ] ?? null;

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
