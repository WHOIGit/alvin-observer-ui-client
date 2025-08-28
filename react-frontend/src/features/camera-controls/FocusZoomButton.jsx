import React, { useRef, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import { Button, CircularProgress } from "@material-ui/core";
import { green } from "@material-ui/core/colors";
import useCameraWebSocket from "../../hooks/useCameraWebSocket";
import useLongPress from "../../hooks/useLongPress";
import { selectCamHeartbeatData } from "./cameraControlsSlice";
import { COMMAND_STRINGS } from "../../config.js";
import { NEW_CAMERA_COMMAND_EVENT } from "../../config.js";


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
  
  //console.log(new Date().toISOString(), "Entering FocusZoomButton - buttonID:", id, activeFocusZoomButton); //test only 24oct2024 - mjs
  
  //disable other zoom/focus buttons on button event - 24oct2024-mjs
  const activeButton = useRef(null); 
  const activeButtonPriority = useRef(null);
  const handleActiveButton = (btn, priority) => {
    activeButton.current = btn; 
    activeButtonPriority.current = priority;   
  };
    
  const { sendMessage } = useCameraWebSocket(NEW_CAMERA_COMMAND_EVENT);

  const handleZoomHold = (commandName, commandValue) => {
    handleSendMessage(commandName, commandValue); 
    //// Set a Timeout to resend command every 1 sec //removed - 08oct2024 - mjs
    //timerRef.current = setTimeout(
    //  handleZoomHold,
    //  1000,
    //  commandName,
    //  commandValue
    //);
  };

  const handleStop = (commandName) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    // delay Stop message sending to avoid collisions with last button actions
    //setTimeout(handleSendMessage, 100, commandName, COMMAND_STRINGS.focusStop); 
    setTimeout(() => { //changed to allow console.log 24oct2024 - mjs
      //console.log(new Date().toISOString(), "FocusZoomButton - onStop - handleSendMessage - buttonID:", id, activeButton.current); //test only 24oct2024 - mjs
      handleSendMessage(commandName, COMMAND_STRINGS.focusStop);
    }, 10); //was 100 - 28oct2024-mjs

    
    
    // add a delay to UI to block aggressive user interactions
    setLoading(true);
    setTimeout(() => {
      
      handleActiveButton(null, id); //24oct2024 - mjs  
      //console.log(new Date().toISOString(), "FocusZoomButton - onStop - blockRelease- buttonID:", id, activeButton.current); //test only 24oct2024 - mjs
      
      buttonClickEvent.current = false; //29oct2024-mjs
      
      setLoading(false);       
      
    }, loadingTime.current);  //was 1000 - changed 08oct2024 - mjs
    
    
    
  };

  const btnProps = useLongPress({
    onClick: () => {
      
      buttonClickEvent.current = true; //29oct2024 - mjs
      loadingTime.current = 1000; //30oct2024 - mjs
      
      handleActiveButton(id, id); //24oct2024 - mjs
      //console.log(new Date().toISOString(), "FocusZoomButton - onClick - buttonID:", id, activeButton.current); //test only 24oct2024 - mjs
       
      handleSendMessage(commandStringControl, commandStringOneStop) 
    },
    
    onLongPress: () => {
    
      buttonClickEvent.current = true; //29oct2024 - mjs
      loadingTime.current = 500; //30oct2024 - mjs
    
      handleActiveButton(id, id); //24oct2024 - mjs
      //console.log(new Date().toISOString(), "FocusZoomButton - onLongPress - buttonID:", id, activeButton.current); //test only 24oct2024 - mjs
    
      handleZoomHold(commandStringControl, commandStringContinuous)
    },
    
    onStop: () => {    
      
      if (buttonClickEvent.current) { //29oct2024 - mjs
        handleStop(commandStringControl)
      }
      
      
    },
  });

  const handleSendMessage = (commandName, commandValue = "UND") => {            
    const payload = {
      action: {
        name: commandName,
        value: commandValue,
      },
    };
    sendMessage(payload);
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
    
    //console.log(new Date().toISOString(), "FocusZoomButton- UseEffect (1) - buttonFunction:", buttonFunction, isEnabled); //test only 24oct2024 - mjs
        
  }, [buttonFunction, camSettings]);
  
  
  //Enable/Disable all Focus/Zoom buttons except active button when a Focus/Zoom button is pressed - 24oct2024 - mjs 
  useEffect(() => {     
    
    //console.log(new Date().toISOString(), "FocusZoomButton - useEffect (2) - buttonID:", id, activeButton.current, activeFocusZoomButton, activeButtonPriority.current); //test only 24oct2024 - mjs
   
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

  //console.log(new Date().toISOString(), "Exiting FocusZoomButton - buttonID:", id, activeButton.current, activeFocusZoomButton, activeButtonPriority.current); //test only 24oct2024 - mjs

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
