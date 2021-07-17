import { createSlice, current } from "@reduxjs/toolkit";

// set default settings
const defaultObserverSide = "P"; // P = Port/ S = Starboard
const defaultFocusMode = "AF";
const defaultExposureMode = "auto";

const initialState = {
  observerSide: defaultObserverSide,
  cameras: [
    {
      camera: "camera1",
      settings: {
        focusMode: defaultFocusMode,
        exposureMode: defaultExposureMode
      },
      lastCommand: null,
      data: {},
      isActive: true,
      isRecording: false
    },
    {
      camera: "camera2",
      settings: {
        focusMode: defaultFocusMode,
        exposureMode: defaultExposureMode
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
        if (element.camera === action.payload.camera) {
          element.lastCommand = action.payload;
          element.lastCommand.action.name = action.payload.action.name;
          element.lastCommand.action.value = action.payload.action.value;
          element.lastCommand.status = "PENDING";
        }
      });
    },
    changeCameraSettings: (state, action) => {
      console.log(action);
      // need to check confirmation of successful command from WebSocket
      const cameras = state.cameras.filter(item => item.lastCommand);
      cameras.forEach(element => {
        if (element.lastCommand.eventID === action.payload.eventID) {
          console.log("THIS IS TRUE?");
          console.log(current(state));
          // If websocket receipt returns OK, update the live settings
          if (action.payload.receipt.status === "OK") {
            element.lastCommand.status = "OK";
            // change the setting variable
            if (element.lastCommand.action.name === "FCM") {
              element.settings.focusMode = element.lastCommand.action.value;
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
  state.cameraControls.cameras.filter(item => item.isActive);

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
