import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { red } from "@material-ui/core/colors";
import { Card, CardContent, Chip, Box } from "@material-ui/core";
import ErrorIcon from "@material-ui/icons/Error";
// local import

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  chip: {
    width: "100%",
    color: "white",
    backgroundColor: theme.palette.error.main,
  },
  iconBox: {
    textAlign: "center",
  },
  icon: {
    color: "white",
    backgroundColor: theme.palette.error.main,
  },
}));

export default function ErrorCard({ errorType }) {
  const classes = useStyles();

  return (
    <Card className={`${classes.root}`}>
      <CardContent>
        <Chip label="CAMERA CHANGE ERROR" className={classes.chip} />
      </CardContent>
      <Box m={1} className={classes.iconBox}>
        <ErrorIcon className={classes.icon} />
      </Box>
    </Card>
  );
}
