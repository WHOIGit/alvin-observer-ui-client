import { CAMERAS } from "../config.js";

export const getCameraConfigFromName = (cameraName) => {
  const cameraConfig = CAMERAS.find((item) => item.cam_name === cameraName);
  return cameraConfig;
};
