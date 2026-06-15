import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import ReportIcon from "@mui/icons-material/Report";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
  dismissReadSystemMessages,
  dismissSystemMessage,
  markAllSystemMessagesRead,
  removeExpiredSystemMessages,
  selectSystemMessages,
  selectUnreadSystemMessageCount,
  selectUnreadSystemMessageCounts,
  selectWorstSystemMessageLevel,
} from "./systemMessagesSlice";

const LEVEL_META = {
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

const IDLE_META = {
  color: "#78909c",
};

const COUNT_LEVELS = ["WARN", "ERROR", "CRITICAL"];

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

function SeverityCount({ level, count }) {
  if (!count) return null;

  const { color, Icon, label } = LEVEL_META[level];

  return (
    <Tooltip title={`${count} unread ${label.toLowerCase()} message${count === 1 ? "" : "s"}`}>
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.25}
        aria-label={`${count} unread ${label.toLowerCase()} message${count === 1 ? "" : "s"}`}
        sx={{
          color,
          minWidth: 28,
          justifyContent: "center",
        }}
      >
        <Icon sx={{ fontSize: 17 }} />
        <Typography variant="caption" component="span" sx={{ fontWeight: 700 }}>
          {count}
        </Typography>
      </Stack>
    </Tooltip>
  );
}

function SystemMessageRow({ message, onDismiss }) {
  const { color, Icon, label } = LEVEL_META[message.level];
  const timeLabel = formatTime(message.timestamp);

  return (
    <Box
      sx={{
        borderLeft: `4px solid ${color}`,
        px: 1,
        py: 0.75,
        bgcolor: message.read ? "rgba(255, 255, 255, 0.03)" : "rgba(255, 255, 255, 0.07)",
      }}
    >
      <Stack direction="row" spacing={1} alignItems="flex-start">
        <Tooltip title={label}>
          <Icon sx={{ color, fontSize: 20, mt: 0.2 }} />
        </Tooltip>
        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
          <Typography
            variant="body2"
            sx={{
              color: "grey.100",
              fontWeight: message.read ? 400 : 700,
              overflowWrap: "anywhere",
            }}
          >
            {message.message || "System message"}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "grey.400", display: "block", mt: 0.25 }}
          >
            {[message.source, timeLabel].filter(Boolean).join(" - ")}
          </Typography>
        </Box>
        <Tooltip title="Dismiss message">
          <IconButton
            aria-label="Dismiss message"
            size="small"
            onClick={() => onDismiss(message.id)}
            sx={{ color: "grey.300", mt: -0.5 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
    </Box>
  );
}

export default function SystemNotificationsBar() {
  const dispatch = useDispatch();
  const [expanded, setExpanded] = useState(false);
  const messages = useSelector(selectSystemMessages);
  const unreadCount = useSelector(selectUnreadSystemMessageCount);
  const unreadCounts = useSelector(selectUnreadSystemMessageCounts);
  const worstLevel = useSelector(selectWorstSystemMessageLevel);

  const worstMeta = worstLevel ? LEVEL_META[worstLevel] : IDLE_META;

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      dispatch(removeExpiredSystemMessages());
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [dispatch]);

  useEffect(() => {
    if (expanded) {
      dispatch(markAllSystemMessagesRead());
    }
  }, [dispatch, expanded, messages.length]);

  const showInfoCount = useMemo(
    () => unreadCounts.INFO > 0 && COUNT_LEVELS.every((level) => unreadCounts[level] === 0),
    [unreadCounts]
  );

  return (
    <Box
      sx={{
        position: "sticky",
        top: 0,
        zIndex: (theme) => theme.zIndex.appBar + 1,
        width: "100%",
        bgcolor: "#111820",
        borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
        boxSizing: "border-box",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          overflow: "hidden",
          bgcolor: "transparent",
          border: 0,
          borderLeft: `5px solid ${worstMeta.color}`,
          borderRadius: 0,
        }}
      >
        <ButtonBase
          aria-label={expanded ? "Collapse system notifications" : "Expand system notifications"}
          onClick={() => setExpanded((value) => !value)}
          sx={{
            width: "100%",
            minHeight: 36,
            px: 1.5,
            py: 0.5,
            justifyContent: "stretch",
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ width: "100%", minWidth: 0 }}
          >
            <NotificationsNoneIcon sx={{ color: "grey.100", fontSize: 20 }} />
            <Typography
              variant="body2"
              sx={{
                color: "grey.100",
                fontWeight: 700,
                lineHeight: 1.1,
                whiteSpace: "nowrap",
              }}
            >
              System
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            {showInfoCount ? (
              <SeverityCount level="INFO" count={unreadCounts.INFO} />
            ) : null}
            {COUNT_LEVELS.map((level) => (
              <SeverityCount key={level} level={level} count={unreadCounts[level]} />
            ))}
            {unreadCount === 0 ? (
              <Typography variant="caption" sx={{ color: "grey.400", whiteSpace: "nowrap" }}>
                {messages.length}
              </Typography>
            ) : null}
            {expanded ? <ExpandLessIcon sx={{ color: "grey.300", fontSize: 20 }} /> : null}
          </Stack>
        </ButtonBase>

        {expanded ? (
          <>
            <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.12)" }} />
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.5}
              sx={{ px: 1.5, py: 0.75 }}
            >
              <Typography
                variant="caption"
                sx={{ color: "grey.300", fontWeight: 700, flexGrow: 1 }}
              >
                {messages.length
                  ? `${messages.length} active notification${messages.length === 1 ? "" : "s"}`
                  : "No active notifications"}
              </Typography>
              <Tooltip title="Mark all read">
                <IconButton
                  aria-label="Mark all system notifications read"
                  size="small"
                  onClick={() => dispatch(markAllSystemMessagesRead())}
                  sx={{ color: "grey.300" }}
                >
                  <DoneAllIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Clear read">
                <IconButton
                  aria-label="Clear read system notifications"
                  size="small"
                  onClick={() => dispatch(dismissReadSystemMessages())}
                  sx={{ color: "grey.300" }}
                >
                  <DeleteSweepIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Collapse">
                <IconButton
                  aria-label="Collapse system notifications"
                  size="small"
                  onClick={() => setExpanded(false)}
                  sx={{ color: "grey.300" }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
            <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.12)" }} />
            <Stack
              spacing={0.5}
              sx={{
                maxHeight: 320,
                overflowY: "auto",
                p: 0.75,
                mx: "auto",
                width: "100%",
                maxWidth: 720,
              }}
            >
              {messages.length ? (
                messages.map((message) => (
                  <SystemMessageRow
                    key={message.id}
                    message={message}
                    onDismiss={(id) => dispatch(dismissSystemMessage(id))}
                  />
                ))
              ) : (
                <Typography
                  variant="body2"
                  sx={{ color: "grey.400", px: 1, py: 1.25, textAlign: "center" }}
                >
                  No system messages
                </Typography>
              )}
            </Stack>
          </>
        ) : null}
      </Paper>
    </Box>
  );
}
