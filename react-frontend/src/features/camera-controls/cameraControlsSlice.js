import { createSlice, current } from "@reduxjs/toolkit";
import useCameraWebSocket from "../../hooks/useCameraWebSocket";
import {
  COMMAND_STRINGS,
  CAMERAS,
  VIDEO_STREAM_CONFIG,
  WS_SERVER_NAMESPACE_PORT,
  WS_SERVER_NAMESPACE_STARBOARD,
  WS_SERVER_NAMESPACE_PILOT
} from "../../config.js";
// set default settings
const defaultObserverVideoSrc = VIDEO_STREAM_CONFIG.portObserverVideo;
const defaultRecordVideoSrc = VIDEO_STREAM_CONFIG.portRecordVideo;

const initialState = {
  observerSide: null, // P = Port/ S = Starboard
  webSocketNamespace: null,
  observerVideoSrc: defaultObserverVideoSrc,
  recordVideoSrc: defaultRecordVideoSrc,
  initialCamHeartbeat: null,
  activeCamera: null,
  camHeartbeatData: null,
  currentCamData: null,
  lastCommand: null,
  availableCameras: null
};

export const cameraControlsSlice = createSlice({
  name: "cameraControls",
  initialState: initialState,
  reducers: {
    setObserverSide: (state, action) => {
      state.observerSide = action.payload;
      if (action.payload === "P") {
        state.webSocketNamespace = WS_SERVER_NAMESPACE_PORT;
      }
      if (action.payload === "S") {
        state.webSocketNamespace = WS_SERVER_NAMESPACE_STARBOARD;
      }
      // set available cameras
      const availableCameras = CAMERAS.filter(item => {
        return item.owner === action.payload;
      });
      state.availableCameras = availableCameras;
    },
    changeActiveCamera: (state, action) => {
      state.activeCamera = action.payload.camera;
    },
    setLastCommand: (state, action) => {
      state.lastCommand = action.payload;
      state.lastCommand.action.name = action.payload.action.name;
      state.lastCommand.action.value = action.payload.action.value;
      state.lastCommand.status = "PENDING";
    },
    changeCameraSettings: (state, action) => {
      // need to check confirmation of successful command from WebSocket
      if (state.lastCommand.eventId === action.payload.eventId) {
        // If websocket receipt returns OK, update the live settings
        if (action.payload.receipt.status === "OK") {
          state.lastCommand.status = "OK";
          // change the camera settings
          switch (state.lastCommand.action.name) {
            // change observer camera
            case COMMAND_STRINGS.cameraChangeCommand:
              state.activeCamera = state.lastCommand.action.value;
              break;
            // change focus mode
            case COMMAND_STRINGS.focusModeCommand:
              state.currentCamData.currentSettings.focus_mode =
                state.lastCommand.action.value;
              break;
            // change shutter mode
            case COMMAND_STRINGS.shutterModeCommand:
              state.currentCamData.currentSettings.SHU =
                state.lastCommand.action.value;
              break;
            // change iris mode
            case COMMAND_STRINGS.irisModeCommand:
              state.currentCamData.currentSettings.IRS =
                state.lastCommand.action.value;
              break;
            // change iso mode
            case COMMAND_STRINGS.isoModeCommand:
              state.currentCamData.currentSettings.ISO =
                state.lastCommand.action.value;
              break;
            // change exposure mode
            case COMMAND_STRINGS.exposureModeCommand:
              state.currentCamData.currentSettings.exposure_mode =
                state.lastCommand.action.value;
          }
        } else {
          state.lastCommand.status = "ERR";
        }
      }
    },
    changeCamHeartbeat: (state, action) => {
      if (state.initialCamHeartbeat === null) {
        state.initialCamHeartbeat = action.payload;
      }
      const camHeartbeatData = action.payload;
      delete camHeartbeatData.eventId;
      delete camHeartbeatData.timestamp;
      if (state.camHeartbeatData === camHeartbeatData) {
        return state;
      }
      state.camHeartbeatData = action.payload;
    },
    changeCurrentCamData: (state, action) => {
      console.log(action.payload);
      state.currentCamData = {};
      state.currentCamData.IRS = action.payload.IRS;
      state.currentCamData.ISO = action.payload.ISO;
      state.currentCamData.SHU = action.payload.SHU;
      state.currentCamData.currentSettings = action.payload.current_settings;
    }
  }
});

// Action creators are generated for each case reducer function
export const {
  changeActiveCamera,
  changeCameraSettings,
  changeCamHeartbeat,
  changeCurrentCamData,
  setLastCommand,
  setObserverSide
} = cameraControlsSlice.actions;

export default cameraControlsSlice.reducer;

// Selector functions
// return only the Active camera currently selected
export const selectActiveCamera = state => state.cameraControls.activeCamera;

// return the current Observer Side
export const selectObserverSide = state => state.cameraControls.observerSide;

// return the current Web Socket server namespace (port/stbd/pilot)
export const selectWebSocketNamespace = state =>
  state.cameraControls.webSocketNamespace;

// return the current CamHeartbeat data
export const selectCamHeartbeatData = state =>
  state.cameraControls.camHeartbeatData;

// return the initial cached CamHeartbeat data
export const selectInitialCamHeartbeatData = state =>
  state.cameraControls.initialCamHeartbeat;

// return the current Camera data the socket returns on a camera change
export const selectCurrentCamData = state =>
  state.cameraControls.currentCamData;
