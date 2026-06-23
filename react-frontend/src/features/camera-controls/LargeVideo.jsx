import React, { useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import makeStyles from '@mui/styles/makeStyles';

// local imports
import { useStream } from "./WebRtcProvider";
import { selectObserverSide } from "./cameraControlsSlice";

const useStyles = makeStyles((theme) => ({
  root: {
    overflowY: "hidden",
  },
  filmImage: {
    marginTop: "20px",
    maxWidth: "100%",
  },
}));

// Pure sink for the large observer/pilot feed. Resolves the same `observerVideoSrc`
// the OBS mini uses, so both share one WebRTC connection (owned by WebRtcProvider)
// and showing/hiding the camera controls never renegotiates.
export default function LargeVideo() {
  const classes = useStyles();
  const videoElem = useRef(null);
  const observerVideoSrc = useSelector(
    (state) => state.cameraControls.observerVideoSrc
  );
  const observerSide = useSelector(selectObserverSide);
  // Wait until a side (and therefore a real source) is chosen before connecting.
  const stream = useStream(observerSide ? observerVideoSrc : null);

  useEffect(() => {
    const el = videoElem.current;
    if (el && stream) {
      el.srcObject = stream;
      el.play?.().catch(() => {});
    }
  }, [stream]);

  return (
    <div className={classes.root}>
      <div id="videoBoxMain">
        <video
          style={{ width: "100%" }}
          id="videoMain"
          ref={videoElem}
          autoPlay
          playsInline  //fix potential iOS black screen - mjs
          muted
        ></video>
      </div>
    </div>
  );
}
