import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import ReactNipple from "react-nipple";
import makeStyles from '@mui/styles/makeStyles';
import { Box, Typography } from "@mui/material";
import { useCameraCommandEmitter } from "../../hooks/useCameraCommandEmitter";
import { useGamepad } from "../../hooks/useGamepad";
import {
  selectActiveCamera,
  selectCamHeartbeatData,
  selectJoystickStatus,
  selectObserverSide,
  setJoystickStatus,
} from "./cameraControlsSlice";
import { nippleDataFromVector } from "./nippleData";
import { COMMAND_STRINGS } from "../../config.js";

const SIZE = 150;
const THRESHOLD = 0.3;

const useStyles = makeStyles((theme) => ({
  root: {
    textAlign: "center",
    userSelect: "none",
  },
}));

export default function Joystick() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const joystickStatus = useSelector(selectJoystickStatus);
  const camSettings = useSelector(selectCamHeartbeatData);
  const [isEnabled, setIsEnabled] = useState(true);
  const [showJoystick, setShowJoystick] = useState(false);

  const observerSide = useSelector(selectObserverSide);
  const activeCameraId = useSelector(selectActiveCamera);
  const { emit } = useCameraCommandEmitter({
    activeCamera: activeCameraId,
    observerSide,
  });

  useEffect(() => {
    // disable joystick if camera has no pan/tilt controls
    // pantilt = "n/N"
    if (
      camSettings &&
      camSettings.pantilt &&
      camSettings.pantilt.trim().toUpperCase() === "N"
    ) {
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

  const sendPanTiltCommand = (commandValue) => {
    // add timestamp to command sent to imaging server for debug
    const timestamp = new Date().toISOString();
    void emit({
      action: {
        name: COMMAND_STRINGS.panTiltCommand,
        value: commandValue,
        timestamp: timestamp,
      },
    });
  };

  // the joystickSpitter is a ref object that tracks the state of the timer
  // created during a Joystick interaction
  const joystickSpitter = useRef({
    intervalId: null,
    lastMove: null,
  });

  const startSpitter = () => {
    if (joystickSpitter.current.intervalId) {
      return;
    }
    console.log("START SPITTER FUNC");
    joystickSpitter.current.intervalId = setInterval(() => {
      // continuously spit out the last move message
      if (joystickSpitter.current.lastMove) {
        sendPanTiltCommand(joystickSpitter.current.lastMove);
      }
    }, 100);
  };

  const stopSpitter = () => {
    clearInterval(joystickSpitter.current.intervalId);
    joystickSpitter.current.intervalId = null;
  };

  // Unnmount this component here
  useEffect(() => {
    return () => {
      // stop the spitter when we unmount this component
      stopSpitter();
      // clear out Redux joystickStatus queue as well
      const payload = null;
      dispatch(setJoystickStatus(payload));
    };
  }, []);

  useEffect(() => {
    if (!joystickStatus) {
      // no op
    } else if (joystickStatus.actionType === "move") {
      // enqueue this move for the spitter timer
      joystickSpitter.current.lastMove = joystickStatus;
    } else if (joystickStatus.actionType === "end") {
      stopSpitter();
      sendPanTiltCommand(joystickStatus);
    }
  }, [joystickStatus]);

  const processJoystickPayload = (payload) => {
    if (payload.actionType === "start") {
      sendPanTiltCommand(payload);
      startSpitter();
      // enqueue a fake "move" event for the spitter
      // note: angle and direction will be undefined
      joystickSpitter.current.lastMove = {
        ...payload,
        distance: 0,
        actionType: "move",
      };
    }
    dispatch(setJoystickStatus(payload));
  };

  const handleJoystickEvents = (evt, data) => {
    processJoystickPayload({
      actionType: evt.type,
      position: data.position,
      distance: data.distance,
      angle: data.angle,
      direction: data.direction,
    });
  };

  // Drive the nipplejs knob so hardware input is visible on the virtual stick.
  const zoneRef = useRef(null);

  const nippleCenter = () => {
    const back = zoneRef.current?.querySelector(".back");
    if (!back) return { x: 0, y: 0 };
    const r = back.getBoundingClientRect();
    return {
      x: r.left + r.width / 2 + window.scrollX,
      y: r.top + r.height / 2 + window.scrollY,
    };
  };

  const moveKnob = (vx, vy) => {
    const front = zoneRef.current?.querySelector(".front");
    if (!front) return;
    front.style.transition = "none";
    front.style.left = `${vx * (SIZE / 2)}px`;
    front.style.top = `${vy * (SIZE / 2)}px`;
  };

  const restKnob = () => {
    const front = zoneRef.current?.querySelector(".front");
    if (!front) return;
    front.style.left = "0px";
    front.style.top = "0px";
  };

  const handleGamepad = (actionType) => (v) => {
    if (!isEnabled) return;
    const data = nippleDataFromVector(v.x, v.y, SIZE, nippleCenter(), THRESHOLD);
    processJoystickPayload({ actionType, ...data });
    if (actionType === "end") restKnob();
    else moveKnob(v.x, v.y);
  };

  const { connected: gamepadConnected } = useGamepad({
    onStart: handleGamepad("start"),
    onMove: handleGamepad("move"),
    onEnd: handleGamepad("end"),
  });

  if (!showJoystick || !isEnabled) {
    return null;
  }

  return (
    <Box mt={3} className={classes.root}>
      <Box ref={zoneRef}>
        <ReactNipple
          options={{
            mode: "static",
            size: SIZE,
            position: { top: "50%", left: "50%" },
            color: "#e1f5fe",
            restOpacity: 0.8,
            dynamicPage: true,
            threshold: THRESHOLD,
          }}
          style={{
            position: "relative",
            width: "100%",
            height: SIZE,
            // if you pass position: 'relative', you don't need to import the stylesheet
          }}
          onStart={(evt, data) => handleJoystickEvents(evt, data)}
          onEnd={(evt, data) => handleJoystickEvents(evt, data)}
          onMove={(evt, data) => handleJoystickEvents(evt, data)}
        />
      </Box>
      <Typography variant="h6">P & T</Typography>
      {gamepadConnected && (
        <Typography variant="caption">🎮 Gamepad connected</Typography>
      )}
    </Box>
  );
}
