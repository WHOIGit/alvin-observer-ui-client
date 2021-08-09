import React from "react";
import { useSelector } from "react-redux";
import { Container, Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
//import SocketProvider from "./utils/SocketProvider";
import ObserverUI from "./features/observer-ui/ObserverUI";
import { SEALOG_URL, CAM_HEARTBEAT } from "./config";
import useCameraWebSocket from "./hooks/useCameraWebSocket";

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
  // connect to CAM_HEARTBEAT, store current cam parameters in Redux state
  const { messages, sendMessage } = useCameraWebSocket(CAM_HEARTBEAT);

  return (
    <Container maxWidth={false} disableGutters={true}>
      <Box>
        <ObserverUI />
      </Box>
      <Box>
        <iframe
          src={SEALOG_URL}
          className={classes.sealogFrame}
          title="sealog"
        />
      </Box>
    </Container>
  );
}
