import React, { useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import film from "../../images/604015.png";

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
        ></video>
      </div>
    </div>
  );
}
