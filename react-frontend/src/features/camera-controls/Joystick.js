import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import ReactNipple from "react-nipple";
import { makeStyles } from "@material-ui/core/styles";
import { Box, Typography } from "@material-ui/core";
import useCameraWebSocket from "../../hooks/useCameraWebSocket";
import { selectCurrentCamData } from "./cameraControlsSlice";
import { COMMAND_STRINGS } from "../../config.js";
import { NEW_CAMERA_COMMAND_EVENT } from "../../config.js";

const useStyles = makeStyles(theme => ({
  noSelect: {
    userSelect: "none"
  }
}));

export default function Joystick() {
  const classes = useStyles();
  const camData = useSelector(selectCurrentCamData);
  const joystickElem = useRef(null);

  const { messages, sendMessage } = useCameraWebSocket(
    NEW_CAMERA_COMMAND_EVENT
  );
  const [showJoystick, setShowJoystick] = useState(false);

  useEffect(() => {
    // delay loading of the virtual joystick until CSS transtion ends (.4s)
    setTimeout(() => {
      setShowJoystick(true);
    }, 500);
  }, []);

  const handleJoystickEvents = (evt, data) => {
    console.log(evt, data);
    const payload = {
      actionType: evt.type,
      position: data.position,
      distance: data.distance,
      angle: data.angle,
      direction: data.direction
    };
    handleSendMessage(COMMAND_STRINGS.panTiltCommand, payload);
  };

  const handleSendMessage = (commandName, commandValue) => {
    if (commandValue === undefined) {
      let commandValue;
    }

    const payload = {
      action: {
        name: commandName,
        value: commandValue
      }
    };
    sendMessage(payload);
  };

  if (!showJoystick) {
    return null;
  }

  return (
    <Box mt={3} className={classes.noSelect}>
      <ReactNipple
        options={{
          mode: "static",
          size: 150,
          position: { top: "50%", left: "50%" },
          color: "blue",
          dynamicPage: true
        }}
        style={{
          position: "relative",
          width: "100%",
          height: 150
          // if you pass position: 'relative', you don't need to import the stylesheet
        }}
        onStart={(evt, data) => handleJoystickEvents(evt, data)}
        onEnd={(evt, data) => handleJoystickEvents(evt, data)}
        onMove={(evt, data) => {
          const payload = {
            actionType: evt.type,
            position: data.position,
            distance: data.distance,
            angle: data.angle,
            direction: data.direction
          };
          handleSendMessage(COMMAND_STRINGS.panTiltCommand, payload);
        }}
      />
      <Typography variant="h6">P & T</Typography>
    </Box>
  );
}
