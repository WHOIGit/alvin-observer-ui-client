import React from "react";
import makeStyles from '@mui/styles/makeStyles';
import { red } from "@mui/material/colors";
import { Card, CardContent, Chip, Box } from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";
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
    color: theme.palette.error.main,
  },
}));

export default function ErrorCard({ errorType }) {
  const classes = useStyles();

  return (
    <Card className={`${classes.root}`}>
      <CardContent>
        <Chip label="Error. Camera Unavailable" className={classes.chip} />
      </CardContent>
      <Box m={1} className={classes.iconBox}>
        <ErrorIcon className={classes.icon} fontSize="large" />
      </Box>
    </Card>
  );
}
