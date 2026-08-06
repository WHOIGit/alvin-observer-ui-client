import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import ReactNipple from "react-nipple";
import makeStyles from '@mui/styles/makeStyles';
import { Box, Typography } from "@mui/material";
import { useObservedCamera } from "./ObservedCameraProvider";
import { selectCamHeartbeatData } from "./cameraControlsSlice";

const useStyles = makeStyles((theme) => ({
  root: {
    textAlign: "center",
    userSelect: "none",
  },
}));

export default function Joystick() {
  const classes = useStyles();
  const camSettings = useSelector(selectCamHeartbeatData);
  const [isEnabled, setIsEnabled] = useState(true);
  const [showJoystick, setShowJoystick] = useState(false);

  const camera = useObservedCamera();

  useEffect(() => {
    // disable joystick if camera has no pan/tilt controls
    if (camSettings && !camSettings.hasPanTilt) {
      setIsEnabled(false);
    } else {
      setIsEnabled(true);
    }
  }, [camSettings]);

  useEffect(() => {
    // delay loading of the virtual joystick until CSS transtion ends (.4s)
    setTimeout(() => {
      setShowJoystick(true);
    }, 100); //was 800 - changed to be closer to zoom/focus load 07oct2024-mjs
  }, []);

  // The in-flight drive; the library owns the keepalive that re-sends the
  // latest move until the gesture ends.
  const driveRef = useRef(null);

  // Stop the keepalive if we unmount mid-gesture (without sending an end).
  useEffect(
    () => () => {
      driveRef.current?.cancel();
      driveRef.current = null;
    },
    []
  );

  const handleJoystickEvents = (evt, data) => {
    const move = {
      actionType: evt.type,
      position: data.position,
      distance: data.distance,
      angle: data.angle,
      direction: data.direction,
    };
    if (evt.type === "start") {
      driveRef.current?.cancel();
      driveRef.current = camera.startPanTilt(move);
    } else if (evt.type === "move") {
      driveRef.current?.update(move);
    } else if (evt.type === "end") {
      driveRef.current?.end(move);
      driveRef.current = null;
    }
  };

  if (!showJoystick || !isEnabled) {
    return null;
  }

  return (
    <Box mt={3} className={classes.root}>
      <ReactNipple
        options={{
          mode: "static",
          size: 150,
          position: { top: "50%", left: "50%" },
          color: "#e1f5fe",
          restOpacity: 0.8,
          dynamicPage: true,
          threshold: 0.3,
        }}
        style={{
          position: "relative",
          width: "100%",
          height: 150,
          // if you pass position: 'relative', you don't need to import the stylesheet
        }}
        onStart={(evt, data) => handleJoystickEvents(evt, data)}
        onEnd={(evt, data) => handleJoystickEvents(evt, data)}
        onMove={(evt, data) => handleJoystickEvents(evt, data)}
      />
      <Typography variant="h6">P & T</Typography>
    </Box>
  );
}
