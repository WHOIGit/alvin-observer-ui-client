import React from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
// local
import { WS_ENDPOINTS } from "../../config";

// POST {server}/api/v1.5/encoder/{name}/{action}
function postEncoder(name, action) {
  const { server, path } = WS_ENDPOINTS["1.5"];
  const base = `${server}${path}`.replace(/\/+$/, "");
  return fetch(`${base}/encoder/${encodeURIComponent(name)}/${action}`, {
    method: "POST",
  }).catch((error) => {
    console.error(`encoder ${action} failed for ${name}`, error);
  });
}

// Small restart/reboot controls for a single encoder, shown under its router
// preview.
export default function EncoderActions({ name }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5, mt: 0.5 }}>
      <Tooltip title={`Restart encoder — ${name}`}>
        <IconButton
          size="small"
          color="inherit"
          aria-label={`Restart encoder ${name}`}
          onClick={() => postEncoder(name, "restart_encoder")}
        >
          <RestartAltIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title={`Reboot — ${name}`}>
        <IconButton
          size="small"
          color="inherit"
          aria-label={`Reboot ${name}`}
          onClick={() => postEncoder(name, "reboot")}
        >
          <PowerSettingsNewIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
