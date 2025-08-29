export const getCameraConfigFromId = (cameraId, cameras) => {
  const cameraConfig = cameras.find((item) => item.camera === cameraId);
  return cameraConfig;
};
