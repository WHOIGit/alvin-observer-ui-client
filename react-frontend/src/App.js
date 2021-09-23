import React from "react";
import { Container, Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
//import SocketProvider from "./utils/SocketProvider";
import PilotUIContainer from "./features/pilot-ui/PilotUIContainer";
import { SEALOG_URL } from "./config";

const useStyles = makeStyles((theme) => ({
  sealogFrame: {
    width: "100%",
    height: "100%",
    position: "absolute",
    border: "none",
  },
  noSelect: {
    userSelect: "none",
  },
}));
export default function App() {
  const classes = useStyles();

  return (
    <Container maxWidth={false} disableGutters={true}>
      <PilotUIContainer />
    </Container>
  );
}
