import {
  amber,
  blueGrey,
  deepOrange,
  lightBlue,
  red,
} from "@mui/material/colors";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import ReportIcon from "@mui/icons-material/Report";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

export const LEVEL_META = {
  INFO: {
    color: lightBlue[300],
    Icon: InfoOutlinedIcon,
    label: "Info",
  },
  WARN: {
    color: amber[600],
    Icon: WarningAmberIcon,
    label: "Warning",
  },
  ERROR: {
    color: deepOrange[400],
    Icon: ErrorOutlineIcon,
    label: "Error",
  },
  CRITICAL: {
    color: red[600],
    Icon: ReportIcon,
    label: "Critical",
  },
};

export const IDLE_META = {
  color: blueGrey[400],
  Icon: NotificationsNoneIcon,
  label: "System messages",
};

export const COUNT_LEVELS = ["WARN", "ERROR", "CRITICAL"];

// Renders a message timestamp as 24-hour UTC HH:MM:SS, appending the UTC date
// when the message is not from the current UTC day.
export const formatSystemMessageTime = (timestamp, now = new Date()) => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";

  const time = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "UTC",
  });

  const sameUtcDay =
    date.getUTCFullYear() === now.getUTCFullYear() &&
    date.getUTCMonth() === now.getUTCMonth() &&
    date.getUTCDate() === now.getUTCDate();

  if (sameUtcDay) return time;

  // en-CA renders the date as an unambiguous YYYY-MM-DD.
  const day = date.toLocaleDateString("en-CA", { timeZone: "UTC" });
  return `${time} ${day}`;
};
