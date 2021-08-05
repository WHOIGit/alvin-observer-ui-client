import React from "react";
import { Container, Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
//import SocketProvider from "./utils/SocketProvider";
import ObserverUI from "./features/observer-ui/ObserverUI";
import useCameraWebSocket from "./hooks/useCameraWebSocket";
import { CAM_HEARTBEAT } from "./config.js";

const useStyles = makeStyles(theme => ({
  sealogFrame: {
    width: "100%",
    height: "100%",
    position: "absolute",
    border: "none"
  }
}));
export default function App() {
  const classes = useStyles();
  const { messages, sendMessage } = useCameraWebSocket(CAM_HEARTBEAT);
  const lastMessage = messages[messages.length - 1];
  //console.log(lastMessage);

  return (
    <Container maxWidth={false} disableGutters={true}>
      <Box>
        <ObserverUI />
      </Box>

      <Box>
        <iframe
          src="https://harmonyhill.whoi.edu/sealog-alvin/"
          className={classes.sealogFrame}
          title="sealog"
        />
      </Box>
    </Container>
  );
}
