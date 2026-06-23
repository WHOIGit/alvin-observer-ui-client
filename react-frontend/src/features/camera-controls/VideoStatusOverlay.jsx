import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { PLAYER_STATUS } from "../../utils/webrtcplayer";

const LABELS = {
  [PLAYER_STATUS.CONNECTING]: "Connecting…",
  [PLAYER_STATUS.RECONNECTING]: "Reconnecting…",
};

// Translucent overlay shown over a video element while the WebRTC connection
// is being (re)established, so a frozen/blank frame reads as "working on it"
// instead of a silent failure. Renders nothing once the stream is connected.
export default function VideoStatusOverlay({ status }) {
  const label = LABELS[status];
  if (!label) return null;

  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        color: "#fff",
        backgroundColor: "rgba(0, 0, 0, 0.55)",
        pointerEvents: "none",
        zIndex: 5,
      }}
    >
      <CircularProgress size={28} color="inherit" />
      <Typography variant="caption" sx={{ fontWeight: 600 }}>
        {label}
      </Typography>
    </Box>
  );
}
