import React from "react";
import Box from "@mui/material/Box";

// Small rounded count chip surfacing the number of unread system messages.
// `color` is the severity color supplied by the caller. Renders nothing when
// the count is zero so callers can drop it inline without guarding.
export default function SystemMessageCountPill({ count, color }) {
  if (!count) return null;

  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 20,
        height: 20,
        px: 0.5,
        borderRadius: "10px",
        bgcolor: color,
        color: "common.white",
        fontSize: 12,
        fontWeight: 700,
        lineHeight: 1,
      }}
    >
      {count}
    </Box>
  );
}
