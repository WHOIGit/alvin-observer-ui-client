import React from "react";
import makeStyles from '@mui/styles/makeStyles';
import { Grid, Typography } from "@mui/material";
import { FOCUS_CONTROLS, ZOOM_CONTROLS } from "../../lib/imaging-client";
import FocusZoomButton from "./FocusZoomButton";

// Continuous zoom drive speed for held buttons.
const ZOOM_SPEED = 3;

const useStyles = makeStyles((theme) => ({
  root: {
    textAlign: "center",
  },
}));



export default function FocusZoomButtons() {
  const classes = useStyles();
  
  //added to track active button and block others - 25oct2024-mjs
  const [activeFocusZoomButton, setActiveFocusZoomButton] = React.useState(null); 
  //const activeFocusZoomButton = React.useRef(null); 
  function handleActiveFocusZoomButton(buttonID, activeButton) {
    //console.log(new Date().toISOString(), "01 - FocusZoomButtons - handleActiveFocusZoomButton - buttonID:", buttonID, activeButton, activeFocusZoomButton); //test only 24oct2024 - mjs
    if ((buttonID === activeButton) && (activeFocusZoomButton !== activeButton)) { 
      setActiveFocusZoomButton(activeButton);
      //activeFocusZoomButton.current = activeButton;  
      
      //console.log(new Date().toISOString(), "02 - FocusZoomButtons - handleActiveFocusZoomButton - buttonID:", buttonID, activeButton, activeFocusZoomButton); //test only 24oct2024 - mjs
    } else {
      if ((buttonID === activeFocusZoomButton) && (activeButton === null)) { 
        setActiveFocusZoomButton(activeButton);
        //activeFocusZoomButton.current = activeButton; 
        
        //console.log(new Date().toISOString(), "03 - FocusZoomButtons - handleActiveFocusZoomButton - buttonID:", buttonID, activeButton, activeFocusZoomButton); //test only 24oct2024 - mjs
      }  
        
    }
    
    //console.log(new Date().toISOString(), "04 - FocusZoomButtons - handleActiveFocusZoomButton - buttonID:", buttonID, activeButton, activeFocusZoomButton); //test only 24oct2024 - mjs
      
  };
  
  return (
    <Grid container spacing={1} className={classes.root}>
      <Grid item xs={6}>
        <FocusZoomButton
          id="focusNear"
          buttonFunction="focus"
          label="Near"
          controlOneStop={FOCUS_CONTROLS.NEAR_ONE_STOP}
          controlContinuous={FOCUS_CONTROLS.NEAR_CONTINUOUS}
          activeFocusZoomButton={activeFocusZoomButton} //25oct2024-mjs
          sendActiveFocusZoomButtonToParent={handleActiveFocusZoomButton} //25oct2024-mjs
        />
      </Grid>
      <Grid item xs={6}>
        <FocusZoomButton
          id="zoomTele"
          buttonFunction="zoom"
          label="Tele"
          controlOneStop={ZOOM_CONTROLS.TELEPHOTO_ONE_STOP}
          controlContinuous={ZOOM_CONTROLS.TELEPHOTO_CONTINUOUS}
          continuousSpeed={ZOOM_SPEED}
          activeFocusZoomButton={activeFocusZoomButton} //25oct2024-mjs
          sendActiveFocusZoomButtonToParent={handleActiveFocusZoomButton} //25oct2024-mjs
        />
      </Grid>
      <Grid item xs={6}>
        <Typography variant="overline" gutterBottom>
          Focus
        </Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography variant="overline" gutterBottom>
          Zoom
        </Typography>
      </Grid>
      <Grid item xs={6}>
        <FocusZoomButton
          id="focusFar"
          buttonFunction="focus"
          label="Far"
          controlOneStop={FOCUS_CONTROLS.FAR_ONE_STOP}
          controlContinuous={FOCUS_CONTROLS.FAR_CONTINUOUS}
          activeFocusZoomButton={activeFocusZoomButton} //25oct2024-mjs
          sendActiveFocusZoomButtonToParent={handleActiveFocusZoomButton} //25oct2024-mjs
        />
      </Grid>
      <Grid item xs={6}>
        <FocusZoomButton
          id="zoomWide"
          buttonFunction="zoom"
          label="Wide"
          controlOneStop={ZOOM_CONTROLS.WIDE_ONE_STOP}
          controlContinuous={ZOOM_CONTROLS.WIDE_CONTINUOUS}
          continuousSpeed={ZOOM_SPEED}
          activeFocusZoomButton={activeFocusZoomButton} //25oct2024-mjs
          sendActiveFocusZoomButtonToParent={handleActiveFocusZoomButton} //25oct2024-mjs
        />
      </Grid>
    </Grid>
  );
}
