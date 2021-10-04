import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import ReactNipple from "react-nipple";
import { makeStyles } from "@material-ui/core/styles";
import { Box, Typography } from "@material-ui/core";
import useCameraWebSocket from "../../hooks/useCameraWebSocket";
import {
  setJoystickQueue,
  selectJoystickQueue,
  clearJoystickQueue,
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
  const joystickQueue = useSelector(selectJoystickQueue);
  const camSettings = useSelector(selectCamHeartbeatData);
  const [isEnabled, setIsEnabled] = useState(true);
  const { sendMessage } = useCameraWebSocket(NEW_CAMERA_COMMAND_EVENT);
  const [showJoystick, setShowJoystick] = useState(false);
  console.log(isEnabled);
  useEffect(() => {
    // disable joystick if camera has no pan/tilt controls
    // pantilt = "n/N"
    if (camSettings.pantilt.trim().toUpperCase() === "N") {
      setIsEnabled(false);
    } else {
      setIsEnabled(true);
    }
  }, [camSettings]);

  useEffect(() => {
    // delay loading of the virtual joystick until CSS transtion ends (.4s)
    setTimeout(() => {
      setShowJoystick(true);
    }, 500);
  }, []);

  useEffect(() => {
    let intervalId;
    if (joystickQueue.length) {
      const lastAction = joystickQueue.slice(-1)[0];
      // force send message on start/end events
      if (
        lastAction.actionType === "start" ||
        lastAction.actionType === "end"
      ) {
        handleSendMessage(lastAction);
      }

      // set interval for function to throttle events send to imaging server
      intervalId = setInterval(() => {
        // assign interval to a variable to clear it.
        console.log(lastAction);
        handleSendMessage(lastAction);
      }, 100);

      console.log(lastAction.actionType);
      // if we get the "end" event, stop the function cycle, reset the state
      if (lastAction.actionType === "end") {
        clearInterval(intervalId);
        dispatch(clearJoystickQueue());
      }
    }
    return () => {
      clearInterval(intervalId);
    };
  }, [joystickQueue]);

  const handleJoystickEvents = (evt, data) => {
    //console.log(evt, data);
    const payload = {
      actionType: evt.type,
      position: data.position,
      distance: data.distance,
      angle: data.angle,
      direction: data.direction,
    };
    dispatch(setJoystickQueue(payload));
  };

  const handleSendMessage = (commandValue) => {
    const payload = {
      action: {
        name: COMMAND_STRINGS.panTiltCommand,
        value: commandValue,
      },
    };
    sendMessage(payload);
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
