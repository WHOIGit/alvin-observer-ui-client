import React, { useRef, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
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
  console.log("Large Video load");
  const classes = useStyles();
  const videoElem = useRef(null);
  const observerVideoSrc = useSelector(
    (state) => state.cameraControls.observerVideoSrc
  );
  const lastCommand = useSelector(selectLastCommand);
  const [player, setPlayer] = useState(null);

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

  useEffect(() => {
    if (showFullCameraControls) {
      console.log("LAST", lastCommand);
      if (!player) {
        // set the player variable
        console.log("SET VIDEO", player);
        if (videoElem.current) {
          const newPlayer = new WebRtcPlayer(
            videoElem.current.id,
            observerVideoSrc /* stream */,
            "0" /* channel */
          );
          setPlayer(newPlayer);
        }
      }
      if (player && lastCommand.action.name === "CAM") {
        // Camera change requested, refresh the connection
        console.log("REFRESH VIDEO", player);
        player.play();
      }
    } else {
      // remove, close any open RTC connections if open
      console.log("CLOSING LARGE VIDEO CONNECTIONS", player);
      if (player) player.handleClose();
    }
  }, [observerVideoSrc, player, showFullCameraControls, lastCommand]);

  return (
    <div className={classes.root}>
      <div id="videoBoxMain">
        <video
          style={{ width: "100%" }}
          id="videoMain"
          ref={videoElem}
          autoPlay
          muted
        ></video>
      </div>
    </div>
  );
}
