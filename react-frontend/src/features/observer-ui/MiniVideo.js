import React, { useEffect, useRef, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Card, CardContent } from "@material-ui/core";
import { useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
// local import
import WebRtcPlayer from "../../utils/webrtcplayer";
import MiniVideoHeader from "./MiniVideoHeader";
import { VIDEO_STREAM_CONFIG } from "../../config.js";
import { selectLastCommand } from "../camera-controls/cameraControlsSlice";

WebRtcPlayer.setServer(VIDEO_STREAM_CONFIG.server);

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  cardContent: {
    padding: 0,
    "&:last-child": {
      paddingBottom: 0,
    },
  },
}));

export default function MiniVideo({
  videoSrc,
  videoType,
  showFullCameraControls,  
}) {
  //console.log("Mini Video load", videoType);
  const classes = useStyles();
  const videoElem = useRef(null);
  const lastCommand = useSelector(selectLastCommand);
  const [player, setPlayer] = useState(null);
  
  const refreshObsVideo = useRef(true);
  const refreshRecVideo = useRef(true);

  //console.log("LAST COM", lastCommand, showFullCameraControls);
  //videoType === "OBS" && console.log(player);
  
  //console.log("MINI VIDEO - Players", videoType, player);
    
  useEffect(() => {
    
    if (!player) {  //changed 13sept2024 - mjs
        
      // set the player variable
      //console.log("MINI VIDEO SET VIDEO PLAYER", videoType, player);
      if (videoElem.current) {
        const newPlayer = new WebRtcPlayer(
          videoElem.current.id,
          videoSrc /* stream */,
          "0" /* channel */
        );
        setPlayer(newPlayer);
                       
      }
    } 
      
    
    // check if player webrtc is closed, refresh if needed
    if (player?.webrtc?.connectionState === "closed") {
      // Camera change requested, refresh the connection
      //console.log("MINI VIDEO PLAYER CLOSED - REFRESH VIDEO", videoType, player);
      player.play();
    }

    if (
      player &&
      lastCommand?.action.name === "CAM" &&
      videoType === "OBS" &&
      !showFullCameraControls
    ) {
      
      //console.log("MINI VIDEO CAM CHANGE", videoType);
      
      /*
      // Camera change requested, close existing tracks and conenctions - added 26june2024 - mjs
      console.log("MINI VIDEO CAM CHANGE - CLOSING CONNECTIONS", player);
      player.close();
      //setPlayer(null);
      
      // Camera change requested, refresh the OBS connection
      console.log("MINI VIDEO CAM CHANGE - REFRESH VIDEO", videoType, player);
      player.play();
      */
      
    }

    if (showFullCameraControls) {
      // clean up, close any open RTC connections for OBS video
      ////console.log("CLOSING MINI VIDEO CONNECTION", player);
      //console.log("MINI VIDEO CLOSE FUNCTION - showFullCameraControls: ", showFullCameraControls, videoType, videoSrc);
      
      /*
      if (player && videoType === "OBS") {
        console.log("MINI VIDEO CLOSING VIDEO CONNECTION", videoType, player);
        player.close();
        setPlayer(null);
      }
      */
      
      if (player && videoType === "OBS") {
         refreshObsVideo.current = true;
      }
      
    }
    /*
    return () => {
      // clean up, close any open RTC connections for OBS video
      console.log("CLOSING MINI VIDEO CONNECTION", player);
      console.log("Close function", showFullCameraControls);
      if (player && videoType === "OBS") player.handleClose();
    };
    */
    
    //console.log("Mini Video - Moving On..!", videoType, player, videoElem.current);
    
  }, [player, showFullCameraControls]); 
//  }, [videoSrc, player, lastCommand, videoType, showFullCameraControls]);

  //console.log("Mini Video  - Nothing to do..!", videoType, player, videoElem.current);
  
 
  return (
    <Card className={`${classes.root}`}>
      <MiniVideoHeader videoType={videoType} />
      <CardContent className={classes.cardContent}>
        <div>          
          <video
            style={{ width: "100%" }}
            ref={videoElem}
            //id={`${videoType}-minivideo`}
            id={uuidv4()}
            autoPlay
            playsInline  //fix potential for iOS/safari black screen - mjs
            muted
          ></video>          
        </div>             
      </CardContent>
    </Card>
  );
  
 
  
}
