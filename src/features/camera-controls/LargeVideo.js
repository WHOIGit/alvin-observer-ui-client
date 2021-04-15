import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import film from "../../images/604015.png";

const useStyles = makeStyles(theme => ({
  root: {
    height: "450px",
    overflowY: "hidden"
  },
  filmImage: {
    marginTop: "20px",
    maxWidth: "100%"
  }
}));

export default function LargeVideo() {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <img src={film} className={classes.filmImage} />
    </div>
  );
}
