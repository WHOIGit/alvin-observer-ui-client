import React, { useEffect, useRef } from "react";
import makeStyles from '@mui/styles/makeStyles';
import { Card, CardContent } from "@mui/material";
// local import
import { useStream } from "./WebRtcProvider";

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

// Shared mini video tile used by both the observer and pilot UIs.
//
// Pure sink: the WebRTC connection is owned by WebRtcProvider and keyed by
// `videoSrc`, so any other view using the same source (e.g. the large feed)
// shares one connection and toggling between them never renegotiates.
//
// `header` is supplied by the caller because the observer and pilot UIs use
// different header components (they read different Redux data). `id` defaults
// to `${videoType}-minivideo`; pass an explicit one when several tiles of the
// same type are on screen (the pilot router view) so DOM ids stay unique.
export default function MiniVideo({ videoSrc, videoType, header, id }) {
  const classes = useStyles();
  const videoElem = useRef(null);
  const stream = useStream(videoSrc);

  useEffect(() => {
    const el = videoElem.current;
    if (el && stream) {
      el.srcObject = stream;
      // Sharing one MediaStream across elements: autoPlay doesn't reliably
      // start a second element, so kick off playback explicitly.
      el.play?.().catch(() => {});
    }
  }, [stream]);

  return (
    <Card className={`${classes.root}`}>
      {header}
      <CardContent className={classes.cardContent}>
        <div>
          <video
            style={{ width: "100%" }}
            ref={videoElem}
            id={id ?? `${videoType}-minivideo`}
            autoPlay
            playsInline  //fix potential for iOS/safari black screen - mjs
            muted
          ></video>
        </div>
      </CardContent>
    </Card>
  );
}
