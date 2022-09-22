import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import ReactNipple from "react-nipple";
import { makeStyles } from "@material-ui/core/styles";
import { Box, Typography } from "@material-ui/core";
import useCameraWebSocket from "../../hooks/useCameraWebSocket";
import {
  setJoystickStatus,
  selectJoystickStatus,
  selectCamHeartbeatData,
} from "./cameraControlsSlice";
import { COMMAND_STRINGS } from "../../config.js";
import { NEW_CAMERA_COMMAND_EVENT } from "../../config.js";

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
  const { sendMessage } = useCameraWebSocket(NEW_CAMERA_COMMAND_EVENT);
  const [showJoystick, setShowJoystick] = useState(false);

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
    }, 800);
  }, []);

  const sendPanTiltCommand = (commandValue) => {
    console.log("JOYSTICK MESSAGE SENT");
    // add timestamp to command sent to imaging server for debug
    const timestamp = new Date().toISOString();
    const payload = {
      action: {
        name: COMMAND_STRINGS.panTiltCommand,
        value: commandValue,
        timestamp: timestamp,
      },
    };
    sendMessage(payload);
  };

  // the joystickSpitter is a ref object that tracks the state of the timer
  // created during a Joystick interaction
  const joystickSpitter = useRef({
    intervalId: null,
    lastMove: null,
  });

  const startSpitter = () => {
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

  // stop the spitter when we unmount this component
  // clear out Redux joystickStatus as well
  useEffect(() => {
    return () => {
      stopSpitter();

      const payload = null;
      dispatch(setJoystickStatus(payload));
    };
  }, []);

  useEffect(() => {
    if (!joystickStatus) {
      // no op
    } else if (joystickStatus.actionType === "start") {
      console.log("STARTING SPITTER");
      sendPanTiltCommand(joystickStatus);
      startSpitter();
      // enqueue a fake "move" event for the spitter
      // note: angle and direction will be undefined
      joystickSpitter.current.lastMove = {
        ...joystickStatus,
        distance: 0,
        actionType: "move",
      };
    } else if (joystickStatus.actionType === "move") {
      // enqueue this move for the spitter timer
      joystickSpitter.current.lastMove = joystickStatus;
      console.log("MOVING JOYSTICK");
    } else if (joystickStatus.actionType === "end") {
      stopSpitter();
      sendPanTiltCommand(joystickStatus);
      console.log("STOPPING SPITTER");
    }
  }, [joystickStatus]);

  const handleJoystickEvents = (evt, data) => {
    const payload = {
      actionType: evt.type,
      position: data.position,
      distance: data.distance,
      angle: data.angle,
      direction: data.direction,
    };
    dispatch(setJoystickStatus(payload));
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
