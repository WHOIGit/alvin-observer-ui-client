import { createSlice, current } from "@reduxjs/toolkit";
import useCameraWebSocket from "../../hooks/useCameraWebSocket";
import { COMMAND_STRINGS, VIDEO_STREAM_CONFIG } from "../../config.js";
// set default settings
const defaultObserverVideoSrc = VIDEO_STREAM_CONFIG.portObserverVideo;
const defaultRecordVideoSrc = VIDEO_STREAM_CONFIG.portRecordVideo;
const defaultFocusMode = COMMAND_STRINGS.focusAF;
const defaultExposureMode = COMMAND_STRINGS.exposureModeOptions[0];
const defaultShutterMode = COMMAND_STRINGS.shutterModeOptions[0];
const defaultIrisMode = COMMAND_STRINGS.irisModeOptions[0];
const defaultIsoMode = COMMAND_STRINGS.isoModeOptions[0];

const initialState = {
  observerSide: null, // P = Port/ S = Starboard
  observerVideoSrc: defaultObserverVideoSrc,
  recordVideoSrc: defaultRecordVideoSrc,
  camHeartbeatData: null,
  cameras: [
    {
      camera: "camera1",
      cameraName: "Camera 1",
      settings: {
        focusMode: defaultFocusMode,
        exposureMode: defaultExposureMode,
        shutterMode: defaultShutterMode,
        irisMode: defaultIrisMode,
        isoMode: defaultIsoMode
      },
      lastCommand: null,
      data: {},
      isActive: false,
      isRecording: false
    },
    {
      camera: "camera2",
      cameraName: "Camera 2",
      settings: {
        focusMode: defaultFocusMode,
        exposureMode: defaultExposureMode,
        shutterMode: defaultShutterMode,
        irisMode: defaultIrisMode,
        isoMode: defaultIsoMode
      },
      lastCommand: null,
      data: {},
      isActive: false,
      isRecording: false
    }
  ]
};

export const cameraControlsSlice = createSlice({
  name: "cameraControls",
  initialState: initialState,
  reducers: {
    setObserverSide: (state, action) => {
      state.observerSide = action.payload;
    },
    changeActiveCamera: (state, action) => {
      state.cameras.forEach(element => {
        if (element.camera === action.payload.camera) {
          element.isActive = true;
        } else {
          element.isActive = false;
        }
      });
    },
    setLastCommand: (state, action) => {
      state.cameras.forEach(element => {
        console.log(action.payload);
        if (element.camera === action.payload.camera) {
          element.lastCommand = action.payload;
          element.lastCommand.action.name = action.payload.action.name;
          element.lastCommand.action.value = action.payload.action.value;
          element.lastCommand.status = "PENDING";
        }
      });
    },
    changeCameraSettings: (state, action) => {
      // need to check confirmation of successful command from WebSocket
      const cameras = state.cameras.filter(item => item.lastCommand);
      cameras.forEach(element => {
        if (element.lastCommand.eventId === action.payload.eventId) {
          console.log(current(element));
          console.log(action.payload);
          // If websocket receipt returns OK, update the live settings
          if (action.payload.receipt.status === "OK") {
            element.lastCommand.status = "OK";
            // change the camera settings
            switch (element.lastCommand.action.name) {
              // change observer camera
              case COMMAND_STRINGS.cameraChangeCommand:
                console.log("CAM CHANGE");
                element.isActive = false;
                // set the new active camera
                const newCamera = state.cameras.filter(
                  item => item.camera === element.lastCommand.action.value
                )[0];
                newCamera.isActive = true;
                break;
              // change focus mode
              case COMMAND_STRINGS.focusModeCommand:
                element.settings.focusMode = element.lastCommand.action.value;
                break;
              // change shutter mode
              case COMMAND_STRINGS.shutterModeCommand:
                element.settings.shutterMode = element.lastCommand.action.value;
                break;
              // change iris mode
              case COMMAND_STRINGS.irisModeCommand:
                element.settings.irisMode = element.lastCommand.action.value;
                break;
              // change iso mode
              case COMMAND_STRINGS.isoModeCommand:
                element.settings.isoMode = element.lastCommand.action.value;
                break;
              // change exposure mode
              case COMMAND_STRINGS.exposureModeCommand:
                element.settings.exposureMode =
                  element.lastCommand.action.value;
            }
          } else {
            element.lastCommand.status = "ERR";
          }
        }
      });
    },
    changeCamHeartbeat: (state, action) => {
      state.camHeartbeatData = action.payload;
    }
  }
});

// Action creators are generated for each case reducer function
export const {
  changeActiveCamera,
  changeCameraSettings,
  changeCamHeartbeat,
  setLastCommand,
  setObserverSide
} = cameraControlsSlice.actions;

export default cameraControlsSlice.reducer;

// Selector functions
// return only the Active camera currently selected
export const selectActiveCamera = state =>
  state.cameraControls.cameras.filter(item => item.isActive)[0];

// return the current Observer Side
export const selectObserverSide = state => state.cameraControls.observerSide;

// return the current Observer Side
export const selectCamHeartbeatData = state =>
  state.cameraControls.camHeartbeatData;
