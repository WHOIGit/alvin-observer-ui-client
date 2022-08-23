import React from "react";
import { Container } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import PilotUIContainer from "./features/pilot-ui/PilotUIContainer";

import "@fontsource/roboto";
import "@fontsource/roboto/700.css";

const useStyles = makeStyles((theme) => ({
  sealogBox: {
    backgroundColor: "black",
    paddingTop: "40px",
  },
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
    <Container
      maxWidth={false}
      disableGutters={true}
      className={classes.noSelect}
    >
      <PilotUIContainer />
    </Container>
  );
}
