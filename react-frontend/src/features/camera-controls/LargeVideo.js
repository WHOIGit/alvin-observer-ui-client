import React, { useRef, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
// local imports
import WebRtcPlayer from "../../utils/webrtcplayer";
import { VIDEO_STREAM_CONFIG } from "../../config.js";
import { selectCurrentCamData } from "./cameraControlsSlice";

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

export default function LargeVideo() {
  console.log("Large Video load");
  const classes = useStyles();
  const videoElem = useRef(null);
  const observerVideoSrc = useSelector(
    (state) => state.cameraControls.observerVideoSrc
  );
  const currentCamData = useSelector(selectCurrentCamData);
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    console.log("VIDEO CAM DATA", currentCamData);

    if (!player) {
      // set the player variable
      if (videoElem.current) {
        const newPlayer = new WebRtcPlayer(
          videoElem.current.id,
          observerVideoSrc /* stream */,
          "0" /* channel */
        );
        setPlayer(newPlayer);
      } else {
        // player exists, refresh the connection
        player.play();
      }
    }
  }, [observerVideoSrc, currentCamData]);

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
