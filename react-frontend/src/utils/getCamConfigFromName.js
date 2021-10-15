import { CAMERAS } from "../config.js";

export const getCameraConfigFromName = (cameraName) => {
  const cameraConfig = CAMERAS.find((item) => item.cam_name === cameraName);
  console.log(cameraConfig);
  return cameraConfig;
};
