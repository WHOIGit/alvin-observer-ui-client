import React from "react";
import { Container, Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
//import WebSocketProvider from "./utils/WebSocket";
import ObserverUI from "./features/observer-ui/ObserverUI";

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
