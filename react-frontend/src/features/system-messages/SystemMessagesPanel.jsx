import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import {
  dismissReadSystemMessages,
  dismissSystemMessage,
  markAllSystemMessagesRead,
  selectSystemMessages,
} from "./systemMessagesSlice";
import { formatSystemMessageTime, LEVEL_META } from "./systemMessageUi";

function SystemMessageRow({ message, onDismiss }) {
  const { color, Icon, label } = LEVEL_META[message.level];
  const timeLabel = formatSystemMessageTime(message.timestamp);

  return (
    <Box
      sx={{
        borderLeft: `4px solid ${color}`,
        px: 1,
        py: 0.75,
        bgcolor: message.read ? "transparent" : "action.hover",
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

export default function SystemMessagesPanel({
  maxHeight = 320,
  markReadOnMount = false,
}) {
  const dispatch = useDispatch();
  const messages = useSelector(selectSystemMessages);

  useEffect(() => {
    if (markReadOnMount) {
      dispatch(markAllSystemMessagesRead());
    }
  }, [dispatch, markReadOnMount, messages.length]);

  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        overflow: "hidden",
      }}
    >
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
      </Stack>
      <Divider sx={{ borderColor: "divider" }} />
      <Stack
        spacing={0.5}
        sx={{
          maxHeight,
          overflowY: "auto",
          p: 0.75,
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
    </Paper>
  );
}
