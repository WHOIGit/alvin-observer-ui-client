export const getCameraConfigFromName = (cameraName, cameras) => {
  const cameraConfig = cameras.find((item) => item.cam_name === cameraName);
  return cameraConfig;
};
