import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import ReportIcon from "@mui/icons-material/Report";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

export const LEVEL_META = {
  INFO: {
    color: "#4fc3f7",
    Icon: InfoOutlinedIcon,
    label: "Info",
  },
  WARN: {
    color: "#ffb300",
    Icon: WarningAmberIcon,
    label: "Warning",
  },
  ERROR: {
    color: "#ff7043",
    Icon: ErrorOutlineIcon,
    label: "Error",
  },
  CRITICAL: {
    color: "#e53935",
    Icon: ReportIcon,
    label: "Critical",
  },
};

// Human-readable labels for the `source` field Suboptica stamps on each alert
// (see suboptica reduce.py). Used to caption control highlights so an operator
// knows which subsystem a flagged control relates to.
export const SOURCE_META = {
  command: { label: "Device command" },
  recorder: { label: "Recorder" },
  capture: { label: "Image capture" },
  telemetry: { label: "Telemetry" },
  station: { label: "Station view" },
  camera: { label: "Camera" },
  sensor: { label: "Sensor" },
};

export const IDLE_META = {
  color: "#78909c",
  Icon: NotificationsNoneIcon,
  label: "System messages",
};

export const COUNT_LEVELS = ["WARN", "ERROR", "CRITICAL"];

export const formatSystemMessageTime = (timestamp) => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};
