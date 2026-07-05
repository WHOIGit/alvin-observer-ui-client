import React from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
// local
import { getSharedImagingClient } from "../../lib/imaging-client";

function encoderAction(name, action) {
  const client = getSharedImagingClient();
  const request =
    action === "reboot" ? client.rebootEncoder(name) : client.restartEncoder(name);
  return request.catch((error) => {
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
          onClick={() => encoderAction(name, "restart_encoder")}
        >
          <RestartAltIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title={`Reboot — ${name}`}>
        <IconButton
          size="small"
          color="inherit"
          aria-label={`Reboot ${name}`}
          onClick={() => encoderAction(name, "reboot")}
        >
          <PowerSettingsNewIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
