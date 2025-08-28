import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Typography } from "@material-ui/core";
import { COMMAND_STRINGS } from "../../config.js";
import FocusZoomButton from "./FocusZoomButton";

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
          commandStringControl={COMMAND_STRINGS.focusControlCommand}
          commandStringOneStop={COMMAND_STRINGS.focusNearOneStop}
          commandStringContinuous={COMMAND_STRINGS.focusNearContinuos}
          activeFocusZoomButton={activeFocusZoomButton} //25oct2024-mjs
          sendActiveFocusZoomButtonToParent={handleActiveFocusZoomButton} //25oct2024-mjs
        />
      </Grid>
      <Grid item xs={6}>
        <FocusZoomButton
          id="zoomTele"
          buttonFunction="zoom"
          label="Tele"
          commandStringControl={COMMAND_STRINGS.zoomControlCommand}
          commandStringOneStop={COMMAND_STRINGS.zoomNearOneStop}
          commandStringContinuous={COMMAND_STRINGS.zoomNearContinuos + ":" + "3"}
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
          commandStringControl={COMMAND_STRINGS.focusControlCommand}
          commandStringOneStop={COMMAND_STRINGS.focusFarOneStop}
          commandStringContinuous={COMMAND_STRINGS.focusFarContinuos}
          activeFocusZoomButton={activeFocusZoomButton} //25oct2024-mjs
          sendActiveFocusZoomButtonToParent={handleActiveFocusZoomButton} //25oct2024-mjs
        />
      </Grid>
      <Grid item xs={6}>
        <FocusZoomButton
          id="zoomWide"
          buttonFunction="zoom"
          label="Wide"
          commandStringControl={COMMAND_STRINGS.zoomControlCommand}
          commandStringOneStop={COMMAND_STRINGS.zoomFarOneStop}
          commandStringContinuous={COMMAND_STRINGS.zoomFarContinuos + ":" + "3"}
          activeFocusZoomButton={activeFocusZoomButton} //25oct2024-mjs
          sendActiveFocusZoomButtonToParent={handleActiveFocusZoomButton} //25oct2024-mjs
        />
      </Grid>
    </Grid>
  );
}
