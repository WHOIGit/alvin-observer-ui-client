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
  const classes = useStyles();
  const videoElem = useRef(null);
  const lastCommand = useSelector(selectLastCommand);
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    if (!player) {
      // set the player variable
      console.log("SET MINI VIDEO", player);
      if (videoElem.current) {
        const newPlayer = new WebRtcPlayer(
          videoElem.current.id,
          videoSrc /* stream */,
          "0" /* channel */
        );
        setPlayer(newPlayer);
      }
    }

    if (showFullCameraControls && videoType === "OBS") {
      // remove, close any open RTC connections if open
      console.log("CLOSING MINI OBS VIDEO CONNECTIONS", player);
      if (player) player.handleClose();
    }

    if (player && lastCommand?.action.name === "CAM" && videoType === "OBS") {
      // Camera change requested, refresh the connection
      console.log("REFRESH VIDEO", player);
      player.play();
    }
  }, [videoSrc, player, lastCommand, videoType, showFullCameraControls]);

  return (
    <Card className={`${classes.root}`}>
      <MiniVideoHeader videoType={videoType} />
      <CardContent className={classes.cardContent}>
        <div>
          <video
            style={{ width: "100%" }}
            ref={videoElem}
            id={`${videoType}-minivideo`}
            //id={uuidv4()}
            autoPlay
            muted
          ></video>
        </div>
      </CardContent>
    </Card>
  );
}
