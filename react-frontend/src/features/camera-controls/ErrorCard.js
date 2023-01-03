import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Card, CardContent, Chip } from "@material-ui/core";
// local import

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  chip: {
    width: "100%",
    color: "white",
    //backgroundColor: theme.palette.success.main
  },
}));

export default function ErrorCard({ errorType }) {
  const classes = useStyles();

  return (
    <Card className={`${classes.root}`}>
      <CardContent>
        <Chip
          label="CAM CHANGE ERROR. CAMERA UNAVAILABLE"
          className={classes.chip}
          color="warning"
        />
      </CardContent>
    </Card>
  );
}
