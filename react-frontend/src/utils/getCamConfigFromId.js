import { CAMERAS } from "../config.js";

export const getCameraConfigFromId = (cameraId) => {
  const cameraConfig = CAMERAS.find((item) => item.camera === cameraId);
  return cameraConfig;
};
