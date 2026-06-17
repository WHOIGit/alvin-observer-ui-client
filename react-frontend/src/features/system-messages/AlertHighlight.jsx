import React from "react";
import { useSelector } from "react-redux";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import {
  selectActiveAlertSources,
  SYSTEM_MESSAGE_PRIORITY,
} from "./systemMessagesSlice";
import { LEVEL_META, SOURCE_META } from "./systemMessageUi";

// Wraps a control and draws a subtle pulsing ring in the alert colour when there
// is an unacknowledged WARN+ system message whose `source` matches, pointing the
// operator at where an issue originates. `source` may be a single source or an
// array (e.g. a control affected by both command failures and heartbeat loss),
// in which case the worst active level wins. When nothing is active it renders
// the children inside a plain Box, so there is no layout shift either way. The
// ring uses box-shadow (painted outside the box) rather than a border, so it
// never nudges surrounding layout.
export default function AlertHighlight({
  source,
  children,
  display = "block",
  sx,
  ...rest
}) {
  const activeSources = useSelector(selectActiveAlertSources);

  const sources = Array.isArray(source) ? source : [source];
  let level = null;
  let activeSource = null;
  sources.forEach((candidate) => {
    const candidateLevel = activeSources[candidate];
    if (
      candidateLevel &&
      (level === null ||
        SYSTEM_MESSAGE_PRIORITY[candidateLevel] > SYSTEM_MESSAGE_PRIORITY[level])
    ) {
      level = candidateLevel;
      activeSource = candidate;
    }
  });

  if (!level) {
    return (
      <Box display={display} sx={sx} {...rest}>
        {children}
      </Box>
    );
  }

  const { color, label: levelLabel } = LEVEL_META[level];
  const sourceLabel = SOURCE_META[activeSource]?.label || activeSource;

  return (
    <Tooltip title={`${sourceLabel}: ${levelLabel} — see system messages`}>
      <Box
        display={display}
        sx={{
          borderRadius: 1,
          boxShadow: `0 0 0 2px ${color}`,
          animation: "alvinAlertPulse 1.8s ease-in-out infinite",
          "@keyframes alvinAlertPulse": {
            "0%, 100%": { boxShadow: `0 0 0 2px ${color}55` },
            "50%": { boxShadow: `0 0 0 3px ${color}` },
          },
          "@media (prefers-reduced-motion: reduce)": {
            animation: "none",
            boxShadow: `0 0 0 2px ${color}`,
          },
          ...sx,
        }}
        {...rest}
      >
        {children}
      </Box>
    </Tooltip>
  );
}
