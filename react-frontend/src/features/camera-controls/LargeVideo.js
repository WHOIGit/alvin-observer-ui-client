import React, { useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  root: {
    overflowY: "hidden"
  },
  filmImage: {
    marginTop: "20px",
    maxWidth: "100%"
  }
}));

export default function LargeVideo() {
  const classes = useStyles();
  const videoElem = useRef(null);

  return (
    <div className={classes.root}>
      <div id="videoBoxMain">
        <video
          style={{ width: "100%" }}
          id="videoMain"
          ref={videoElem}
          autoPlay
          muted
          controls
        >
          <source
            src="http://128.128.184.12/httplive/stream.m3u8"
            type="application/vnd.apple.mpegurl"
          />
        </video>
      </div>
    </div>
  );
}
