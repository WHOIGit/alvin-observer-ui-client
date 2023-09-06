import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import { Card, CardContent } from "@material-ui/core";
import { v4 as uuidv4 } from "uuid";
// local import
import WebRtcPlayer from "../../utils/webrtcplayer";
import MiniVideoHeader from "./MiniVideoHeader";
import { VIDEO_STREAM_CONFIG } from "../../config.js";
import { selectCamHeartbeatData } from "./cameraControlsSlice";

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

export default function MiniVideo({ videoSrc, videoType }) {
  const classes = useStyles();
  const videoElem = useRef(null);
  const camSettings = useSelector(selectCamHeartbeatData);
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    if (!player) {
      // set the player variable
      console.log("SET VIDEO");
      if (videoElem.current) {
        const newPlayer = new WebRtcPlayer(
          videoElem.current.id,
          videoSrc /* stream */,
          "0" /* channel */
        );
        setPlayer(newPlayer);
      }
    } else {
      // player exists, refresh the connection
      console.log("REFRESH VIDEO");
      player.play();
    }
  }, [videoSrc, camSettings, player]);

  return (
    <Card className={`${classes.root}`}>
      <MiniVideoHeader videoType={videoType} />
      <CardContent className={classes.cardContent}>
        <div>
          <video
            style={{ width: "100%" }}
            ref={videoElem}
            id={uuidv4()}
            autoPlay
            muted
          ></video>
        </div>
      </CardContent>
    </Card>
  );
}
