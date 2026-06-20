import { configureStore } from "@reduxjs/toolkit";
import cameraControlsReducer from "./features/camera-controls/cameraControlsSlice";
import systemMessagesReducer from "./features/system-messages/systemMessagesSlice";

export default configureStore({
  reducer: {
    cameraControls: cameraControlsReducer,
    systemMessages: systemMessagesReducer,
  },
});
