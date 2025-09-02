import React, { useRef, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";

import { v4 as uuidv4 } from "uuid";  //for troubleshooting-28june2024-mjs 

// local imports
import WebRtcPlayer from "../../utils/webrtcplayer";
import { VIDEO_STREAM_CONFIG } from "../../config.js";
import { selectLastCommand } from "./cameraControlsSlice";

WebRtcPlayer.setServer(VIDEO_STREAM_CONFIG.server);

const useStyles = makeStyles((theme) => ({
  root: {
    overflowY: "hidden",
  },
  filmImage: {
    marginTop: "20px",
    maxWidth: "100%",
  },
}));

export default function LargeVideo({ showFullCameraControls }) {
  //console.log("Large Video load", showFullCameraControls); //testing - mjs
  
  const classes = useStyles();
  const videoElem = useRef(null);
  const observerVideoSrc = useSelector(
    (state) => state.cameraControls.observerVideoSrc
  );
  const lastCommand = useSelector(selectLastCommand);
  const [player, setPlayer] = useState(null);
  
  const showVideo = useRef(false);
  
  /*
  // function to get direct stats from the RTCPeerConnection
  // probably need to put this on a timer to get useful data
  async function checkVideoStats() {
    if (player) {
      const stats = await player.webrtc.getStats();
      console.log("CHECK STATS");
      stats.forEach((report) => {
        console.log(report);
        if (report.type === "inbound-rtp" && report.kind === "video") {
          // Log the frame rate
          console.log(report.framesPerSecond);
        }
      });
    }
  }
  checkVideoStats();
  */

  //console.log("Large Video - Caller status:", observerVideoSrc, player, showFullCameraControls, lastCommand, videoElem.current);

  useEffect(() => {
    if (showFullCameraControls) {
      //console.log("Large Video - showFullCameraControls:", showFullCameraControls, lastCommand, player);
      //console.log("Large Video - Player status:", player);
      if (!player) {
        // set the player variable
        console.log("Large Video - Player does not exist..!", player, videoElem.current);
        if (videoElem.current) {
          const newPlayer = new WebRtcPlayer(
            videoElem.current.id,
            observerVideoSrc /* stream */,
            "0" /* channel */
          );
          setPlayer(newPlayer);
          console.log("Large Video - New Player Created:", player, newPlayer, videoElem.current);
          //newPlayer.play();  //mjs not sure about this
          //console.log("Large Video - New Player started:", player, newPlayer);
                
        } 
      }

      
      /*
      // camera change, refresh video
      if (player && lastCommand.action.name === "CAM") {
        // Camera change requested, close existing tracks and conenctions - added 26june2024 - mjs
        console.log("Large Video - Cam Change - CLOSING CONNECTIONS", player);
        player.close();
        //setPlayer(null);
        
        // Camera change requested, refresh the connection
        console.log("Large Video - Cam Change - Refresh Video Player", player);
        player.play();
      }
      */ 
      
      //if (player && lastCommand.action.name === "CAM") {
      //  console.log("Large Video - Cam Change", observerVideoSrc);
      //}     

      // check if player webrtc is closed, refresh if needed
      if (player?.webrtc?.connectionState === "closed") {
        // Camera change requested, refresh the connection
        console.log("Large Video - Player Closed - Refresh Video", player);
        player.play();
      }
      
      
      showVideo.current = true;
      console.log("Large Video - showVideo:", showVideo.current);
      
    } else {
      // remove, close any open RTC connections if open
      //console.log("LARGE VIDEO CLOSING CONNECTIONS", player);
      
      /*
      if (player) {
        console.log("LARGE VIDEO CLOSING PLAYER CONNECTIONS", player);
        player.close();
        setPlayer(null);
        
        //videoElem.current = null;
        //console.log("LARGE VIDEO CLEANING UP VIDEO ELEMENTS", videoElem.current);
             
      }
      */
      
      //var videoElement = document.getElementById(videoElem.current.id);
      //videoElement.pause();
      //videoElement.removeAttribute('src'); // empty source
      //videoElement.load();
      
      showVideo.current = false;
      console.log("Large Video - showVideo:", showVideo.current);
      
    }
    
    //console.log("Large Video - Moving On..!", observerVideoSrc, player, showFullCameraControls, lastCommand, videoElem.current);
    
  //}, [observerVideoSrc, player, showFullCameraControls, lastCommand]); //removed lastCommand, causes excess renders and cpu usage - 29oct2024 - mjs
  }, [observerVideoSrc, player, showFullCameraControls]);
  
  //console.log("Large Video - Nothing to do..!", observerVideoSrc, player, showFullCameraControls, lastCommand, videoElem.current);
  
      
  return (
    <div className={classes.root}>
      <div id="videoBoxMain">
        <video
          style={{ width: "100%" }}
          //id="videoMain"
          id={uuidv4()} //mjs
          ref={videoElem}
          autoPlay
          playsInline  //fix potential iOS black screen - mjs
          muted
        ></video>
      </div>
    </div>
  );
  
     
}
