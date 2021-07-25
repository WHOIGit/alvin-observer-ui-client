import { createSlice, current } from "@reduxjs/toolkit";
import { COMMAND_STRINGS } from "../../config.js";
// set default settings
const defaultObserverSide = "COVP"; // P = Port/ S = Starboard
const defaultFocusMode = COMMAND_STRINGS.focusAF;
const defaultExposureMode = COMMAND_STRINGS.exposureModeOptions[0];
const defaultShutterMode = COMMAND_STRINGS.shutterModeOptions[0];
const defaultIrisMode = COMMAND_STRINGS.irisModeOptions[0];
const defaultIsoMode = COMMAND_STRINGS.isoModeOptions[0];

const initialState = {
  observerSide: defaultObserverSide,
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
      isActive: true,
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
      const cameras = state.cameras.filter(item => item.isActive);
      cameras.forEach(element => {
        if (element.lastCommand.eventID === action.payload.eventID) {
          console.log(current(element));
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
                console.log("FOCUS");
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
    }
  }
});

// Action creators are generated for each case reducer function
export const {
  changeActiveCamera,
  changeCameraSettings,
  setLastCommand
} = cameraControlsSlice.actions;

export default cameraControlsSlice.reducer;

// Selector functions
// return only the Active camera currently selected
export const selectActiveCamera = state =>
  state.cameraControls.cameras.filter(item => item.isActive)[0];

// return only the Active camera currently selected
export const selectObserverSide = state => state.cameraControls.observerSide;

// return a flat array of just the dataLayer IDs
export const selectVisibleLayerIds = state => {
  const layerIds = state.dataLayers.layers
    .filter(layer => layer.visibility)
    .map(layer => layer.id);
  return layerIds;
};

// return a flat array of just the dataLayer IDs that are interactive with Mapbox Layer propery
export const selectInteractiveLayerIds = state => {
  const layerIds = state.dataLayers.layers
    .filter(layer => layer.visibility)
    .filter(layer => layer.interactiveLayer)
    .map(layer => layer.id);
  return layerIds;
};

// return a flat array of just the dataLayer IDs that have a Legend pane
export const selectLayerLegendIds = state => {
  const layerIds = state.dataLayers.layers
    .filter(layer => layer.legendVisibility)
    .map(layer => layer.id);
  return layerIds;
};

// return max/mean value selection
export const selectMaxMeanOption = state => state.dataLayers.showMaxMean;
