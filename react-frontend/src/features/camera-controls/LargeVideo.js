import React, { useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
// local imports
import WebRtcPlayer from "../../utils/webrtcplayer";
import { VIDEO_STREAM_CONFIG } from "../../config.js";

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
  const classes = useStyles();
  const videoElem = useRef(null);
  const observerVideoSrc = useSelector(
    (state) => state.cameraControls.observerVideoSrc
  );

  useEffect(() => {
    const videoObserver = videoElem.current;
    if (videoObserver) {
      // eslint-disable-next-line no-unused-vars
      const playerObserver = new WebRtcPlayer(
        videoObserver.id,
        observerVideoSrc
      );
    }
  }, [observerVideoSrc]);

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
