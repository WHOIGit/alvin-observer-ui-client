import React from "react";
import Box from "@mui/material/Box";
import { statusMeta } from "./healthUi";

// Colour + icon + text status indicator (never colour alone).
// variant: "cell" (matrix), "light" (header dot), "chip" (drawer/services).
export default function StatusBadge({ status, variant = "cell", label }) {
  const meta = statusMeta(status);
  const { color, Icon } = meta;

  if (variant === "light") {
    return (
      <Box
        component="span"
        sx={{ display: "inline-flex", alignItems: "center", color }}
        aria-label={meta.label}
        title={meta.label}
      >
        <Icon sx={{ fontSize: 18 }} />
      </Box>
    );
  }

  if (variant === "chip") {
    return (
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.5,
          px: 0.75,
          py: 0.25,
          borderRadius: 1,
          bgcolor: `${color}22`,
          border: `1px solid ${color}`,
          color,
          fontWeight: 700,
          fontSize: 12,
          textTransform: "uppercase",
          letterSpacing: 0.4,
        }}
      >
        <Icon sx={{ fontSize: 16 }} />
        {label || meta.label}
      </Box>
    );
  }

  // "cell"
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 0.4,
        width: "100%",
        height: "100%",
        minHeight: 26,
        px: 0.5,
        borderRadius: 0.75,
        bgcolor: `${color}1f`,
        color,
        fontWeight: 700,
        fontSize: 11,
        lineHeight: 1,
      }}
      aria-label={meta.label}
    >
      <Icon sx={{ fontSize: 14 }} />
      <Box component="span">{meta.text}</Box>
    </Box>
  );
}
