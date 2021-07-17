import { configureStore } from "@reduxjs/toolkit";
import cameraControlsReducer from "./features/camera-controls/cameraControlsSlice";

export default configureStore({
  reducer: {
    cameraControls: cameraControlsReducer
  }
});
