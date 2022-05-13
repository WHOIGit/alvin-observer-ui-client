import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import { deepOrange } from "@material-ui/core/colors";
// local
import RouterControlContainer from "./RouterControlContainer";
import CameraControlContainer from "./CameraControlContainer";
import MetaDataDisplay from "./MetaDataDisplay";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function tabProps(index) {
  return {
    id: `pilot-ui-tab-${index}`,
    "aria-controls": `pilot-ui-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    userSelect: "none",
  },
  tabs: {
    flexGrow: 2,
  },
  metaData: {
    flexGrow: 1,
  },
  indicator: {
    backgroundColor: deepOrange[500],
  },
}));

export default function SimpleTabs() {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <div className={classes.tabs}>
            <Tabs
              value={value}
              onChange={handleChange}
              aria-label="Pilot UI Tabs"
              classes={{
                indicator: classes.indicator,
              }}
            >
              <Tab label="ROUTER CONTROL" {...tabProps(0)} />
              <Tab label="CAMERA CONTROL" {...tabProps(1)} />
            </Tabs>
          </div>

          <div className={classes.metaData}>
            <MetaDataDisplay />
          </div>
        </Toolbar>
      </AppBar>
      <TabPanel value={value} index={0}>
        <RouterControlContainer />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <CameraControlContainer />
      </TabPanel>
    </div>
  );
}
