import React, { useRef, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import makeStyles from '@mui/styles/makeStyles';
import { Button, CircularProgress } from "@mui/material";
import { green } from "@mui/material/colors";
import { useCameraCommandEmitter } from "../../hooks/useCameraCommandEmitter";
import useLongPress from "../../hooks/useLongPress";
import {
  selectActiveCamera,
  selectCamHeartbeatData,
  selectObserverSide,
} from "./cameraControlsSlice";
import { COMMAND_STRINGS } from "../../config.js";


const useStyles = makeStyles((theme) => ({
  buttonWrapper: {
    position: "relative",
  },
  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
}));



export default function FocusZoomButton({
  id,
  buttonFunction,
  label,
  commandStringControl,
  commandStringOneStop,
  commandStringContinuous,
  activeFocusZoomButton,
  sendActiveFocusZoomButtonToParent,  
}) {
  const classes = useStyles();
  const timerRef = useRef(false);
  const camSettings = useSelector(selectCamHeartbeatData);
  const [isEnabled, setIsEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const buttonClickEvent = useRef(false); //block extra stop loop on mouse up event - 29oct2024-mjs
  const loadingTime = useRef(1000); //allow different stop loading time for onClick vs onLongPress - 30oct2024-mjs
  
  //disable other zoom/focus buttons on button event
  const activeButton = useRef(null);
  const activeButtonPriority = useRef(null);
  const handleActiveButton = (btn, priority) => {
    activeButton.current = btn; 
    activeButtonPriority.current = priority;   
  };

  const observerSide = useSelector(selectObserverSide);
  const activeCameraId = useSelector(selectActiveCamera);
  const { emit } = useCameraCommandEmitter({
    activeCamera: activeCameraId,
    observerSide,
  });

  const handleZoomHold = (commandName, commandValue) => {
    handleSendMessage(commandName, commandValue);
  };

  const handleStop = (commandName) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    // delay Stop message sending to avoid collisions with last button actions
    setTimeout(() => {
      handleSendMessage(commandName, COMMAND_STRINGS.focusStop);
    }, 10);

    // add a delay to UI to block aggressive user interactions
    setLoading(true);
    setTimeout(() => {
      handleActiveButton(null, id);
      buttonClickEvent.current = false;
      setLoading(false);
    }, loadingTime.current);
  };

  const btnProps = useLongPress({
    onClick: () => {
      buttonClickEvent.current = true;
      loadingTime.current = 1000;
      handleActiveButton(id, id);
      handleSendMessage(commandStringControl, commandStringOneStop);
    },

    onLongPress: () => {
      buttonClickEvent.current = true;
      loadingTime.current = 500;
      handleActiveButton(id, id);
      handleZoomHold(commandStringControl, commandStringContinuous);
    },

    onStop: () => {
      if (buttonClickEvent.current) {
        handleStop(commandStringControl);
      }
    },
  });

  const handleSendMessage = (commandName, commandValue = "UND") => {            
    void emit({
      action: {
        name: commandName,
        value: commandValue,
      },
    });
  };

  useEffect(() => {
    // set enabled status from camSettings.focus_mode
    // if AUTO focus, disable
    
    if (
      camSettings &&
      camSettings.focus_mode === "AF" &&
      buttonFunction === "focus"
    ) {
      setIsEnabled(false);
    } else {
      setIsEnabled(true);
    }
  }, [buttonFunction, camSettings]);


  // Enable/disable all focus/zoom buttons except the active one while a
  // focus/zoom button is pressed
  useEffect(() => {
    if (activeFocusZoomButton === null) {
      handleActiveButton(null, null);

      if ((camSettings.focus_mode === "MF" && buttonFunction === "focus") || (buttonFunction === "zoom")) {
        setIsEnabled(true);
      }
    } else {
      if (activeButtonPriority.current !== id) {
        setIsEnabled(false);
      }
    }
  }, [activeFocusZoomButton]);

  return (
    <div className={classes.buttonWrapper}>
      <Button
        variant="contained"
        color="secondary"
        size="small"
        disabled={!isEnabled || loading}
        {...btnProps}
      >
        {label}
      </Button>
      {loading && (
        <CircularProgress size={24} className={classes.buttonProgress} />
      )}
    {sendActiveFocusZoomButtonToParent(id, activeButton.current)}  
    </div>
  );
}
