import React from "react";
import { Container, Box } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import ObserverUIContainer from "./features/observer-ui/ObserverUIContainer";
import { SEALOG_URL } from "./config";

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
    <Container maxWidth={false} disableGutters={true}>
      <Box className={classes.noSelect}>
        <ObserverUIContainer />
      </Box>
      <Box className={[classes.noSelect, classes.sealogBox]}>
        <iframe
          src={SEALOG_URL}
          className={classes.sealogFrame}
          title="sealog"
        />
      </Box>
    </Container>
  );
}
