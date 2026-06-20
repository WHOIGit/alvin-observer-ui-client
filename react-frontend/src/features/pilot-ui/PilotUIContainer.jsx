import React from "react";
import PropTypes from "prop-types";
import makeStyles from '@mui/styles/makeStyles';
import { useSelector } from "react-redux";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { deepOrange } from "@mui/material/colors";
// local
import CamHeartbeatListener from "../listeners/CamHeartbeatListener";
import NewCameraCommandListener from "../listeners/NewCameraCommandListener";
import RecorderHeartbeatListener from "../listeners/RecorderHeartbeatListener";
import { WS_SERVER_NAMESPACE_PORT, WS_SERVER_NAMESPACE_STARBOARD } from "../../config";
import RouterControlContainer from "./RouterControlContainer";
import CameraControlContainer from "./CameraControlContainer";
import MetaDataDisplay from "./MetaDataDisplay";
import SystemMessagesPanel from "../system-messages/SystemMessagesPanel";
import SystemMessageCountPill from "../system-messages/SystemMessageCountPill";
import {
  selectUnreadSystemMessageCount,
  selectWorstSystemMessageLevel,
} from "../system-messages/systemMessagesSlice";
import { IDLE_META, LEVEL_META } from "../system-messages/systemMessageUi";

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
          {children}
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
  const unreadSystemMessageCount = useSelector(selectUnreadSystemMessageCount);
  const worstSystemMessageLevel = useSelector(selectWorstSystemMessageLevel);
  const systemBadgeColor = worstSystemMessageLevel
    ? LEVEL_META[worstSystemMessageLevel].color
    : IDLE_META.color;

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <>
      <CamHeartbeatListener />
      <CamHeartbeatListener namespaceOverride={`/${WS_SERVER_NAMESPACE_PORT}`} />
      <CamHeartbeatListener namespaceOverride={`/${WS_SERVER_NAMESPACE_STARBOARD}`} />
      <NewCameraCommandListener />
      <RecorderHeartbeatListener />

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
                <Tab
                  label={
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.75,
                      }}
                    >
                      SYSTEM
                      <SystemMessageCountPill
                        count={unreadSystemMessageCount}
                        color={systemBadgeColor}
                      />
                    </Box>
                  }
                  {...tabProps(2)}
                />
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
        <TabPanel value={value} index={2}>
          <SystemMessagesPanel maxHeight={520} />
        </TabPanel>
      </div>
    </>
  );
}
