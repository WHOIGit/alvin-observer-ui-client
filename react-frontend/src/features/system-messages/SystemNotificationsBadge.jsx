import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Badge from "@mui/material/Badge";
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import Tooltip from "@mui/material/Tooltip";
import SystemMessagesPanel from "./SystemMessagesPanel";
import {
  removeExpiredSystemMessages,
  selectSystemMessages,
  selectUnreadSystemMessageCount,
  selectWorstSystemMessageLevel,
} from "./systemMessagesSlice";
import { IDLE_META, LEVEL_META } from "./systemMessageUi";

export default function SystemNotificationsBadge() {
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState(null);
  const messages = useSelector(selectSystemMessages);
  const unreadCount = useSelector(selectUnreadSystemMessageCount);
  const worstLevel = useSelector(selectWorstSystemMessageLevel);
  const open = Boolean(anchorEl);

  const worstMeta = worstLevel ? LEVEL_META[worstLevel] : IDLE_META;
  const Icon = worstMeta.Icon;
  const visibleCount = unreadCount || messages.length;

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
    dispatch(removeExpiredSystemMessages());
  };

  return (
    <>
      <Tooltip title="System messages">
        <IconButton
          aria-label="Open system notifications"
          onClick={handleOpen}
          sx={{
            width: 48,
            height: 44,
            borderRadius: 1,
            flexShrink: 0,
            color: worstMeta.color,
            bgcolor: "rgba(17, 24, 32, 0.9)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderLeft: `4px solid ${worstMeta.color}`,
            "&:hover": {
              bgcolor: "rgba(31, 39, 50, 0.95)",
            },
          }}
        >
          <Badge
            badgeContent={visibleCount || null}
            sx={{
              "& .MuiBadge-badge": {
                bgcolor: worstMeta.color,
                color: "#fff",
                fontWeight: 700,
                minWidth: 16,
                height: 16,
                px: 0.5,
              },
            }}
          >
            <Icon fontSize="small" />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            mt: 1,
            width: 420,
            maxWidth: "calc(100vw - 24px)",
            bgcolor: "transparent",
            boxShadow: "0 12px 28px rgba(0, 0, 0, 0.35)",
          },
        }}
      >
        <SystemMessagesPanel maxHeight={320} />
      </Popover>
    </>
  );
}
