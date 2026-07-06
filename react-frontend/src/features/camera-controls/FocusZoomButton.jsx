import React, { useRef, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import makeStyles from '@mui/styles/makeStyles';
import { Button, CircularProgress } from "@mui/material";
import { green } from "@mui/material/colors";
import { useImagingStation } from "../../hooks/useImagingClient";
import useLongPress from "../../hooks/useLongPress";
import {
  selectActiveCamera,
  selectCamHeartbeatData,
  selectObserverSide,
} from "./cameraControlsSlice";
import {
  FOCUS_CONTROLS,
  FOCUS_MODES,
  ZOOM_CONTROLS,
} from "../../lib/imaging-client";


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
  buttonFunction, // "focus" | "zoom" — selects the drive this button operates
  label,
  controlOneStop, // FOCUS_CONTROLS / ZOOM_CONTROLS value for a single click
  controlContinuous, // FOCUS_CONTROLS / ZOOM_CONTROLS value while held
  continuousSpeed, // optional drive speed for the continuous control
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

  const observerSide = useSelector(selectObserverSide);
  const activeCameraId = useSelector(selectActiveCamera);
  const camera = useImagingStation(observerSide).camera(activeCameraId ?? null);

  const handleZoomHold = () => {
    drive(controlContinuous, continuousSpeed);
    //// Set a Timeout to resend command every 1 sec //removed - 08oct2024 - mjs
  };

  const handleStop = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    const stopControl =
      buttonFunction === "zoom" ? ZOOM_CONTROLS.STOP : FOCUS_CONTROLS.STOP;
    // delay Stop message sending to avoid collisions with last button actions
    setTimeout(() => { //changed to allow console.log 24oct2024 - mjs
      //console.log(new Date().toISOString(), "FocusZoomButton - onStop - buttonID:", id, activeButton.current); //test only 24oct2024 - mjs
      drive(stopControl);
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
       
      drive(controlOneStop)
    },

    onLongPress: () => {

      buttonClickEvent.current = true; //29oct2024 - mjs
      loadingTime.current = 500; //30oct2024 - mjs

      handleActiveButton(id, id); //24oct2024 - mjs
      //console.log(new Date().toISOString(), "FocusZoomButton - onLongPress - buttonID:", id, activeButton.current); //test only 24oct2024 - mjs

      handleZoomHold()
    },

    onStop: () => {

      if (buttonClickEvent.current) { //29oct2024 - mjs
        handleStop()
      }


    },
  });

  const drive = (control, speed) => {
    if (buttonFunction === "zoom") {
      camera.zoom(control, speed);
    } else {
      camera.focus(control);
    }
  };

  useEffect(() => {
    // set enabled status from camSettings.focus_mode
    // if AUTO focus, disable
    
    if (
      camSettings &&
      camSettings.focus_mode === FOCUS_MODES.AUTOFOCUS &&
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
              
       if ((camSettings.focus_mode === FOCUS_MODES.MANUAL && buttonFunction === "focus") || (buttonFunction === "zoom")) {
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
