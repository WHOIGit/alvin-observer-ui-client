import React, { useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import HealthMatrix from "./HealthMatrix";
import ServicesGrid from "./ServicesGrid";
import HealthDetailDrawer from "./HealthDetailDrawer";
import { useHealthContext } from "./HealthContext";
import { formatAge } from "./healthUi";
import { MOCK_HEALTH } from "../../config";

// System health view: station-grouped matrix + services grid + cell detail
// drawer. The overall status lives on the SYSTEM tab; here "updated Xs ago"
// rides in the services header and a stale feed greys everything.
export default function SystemHealthPanel({ maxHeight = 520 }) {
  const { document, now, stale } = useHealthContext();
  const [selection, setSelection] = useState(null);

  // Fixture data suppresses both live sources and re-stamps its own timestamp,
  // so nothing else on this view can give it away. Say it plainly.
  const mockBanner = MOCK_HEALTH ? (
    <Box
      data-testid="mock-health-banner"
      sx={{
        px: 1.5,
        py: 0.75,
        borderRadius: 1,
        bgcolor: "#c62828",
        border: "2px solid #ff5252",
      }}
    >
      <Typography
        sx={{
          color: "#fff",
          fontSize: 13,
          fontWeight: 800,
          letterSpacing: 0.5,
        }}
      >
        MOCK DATA — NOT LIVE. This is a static fixture; the vitals feed is
        disabled. Do not use for operational decisions.
      </Typography>
    </Box>
  ) : null;

  if (!document) {
    return (
      <Box sx={{ p: 2 }}>
        {mockBanner}
        <Typography sx={{ color: "grey.400" }}>
          Waiting for system health feed…
        </Typography>
      </Box>
    );
  }

  const ageLabel = formatAge(document.generated_at, now);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
      {mockBanner}

      {/* Stale / dropped feed banner (only when stale) */}
      {stale ? (
        <Box
          sx={{
            px: 1.5,
            py: 0.5,
            borderRadius: 1,
            bgcolor: "#78909c22",
            border: "1px solid #78909c",
          }}
        >
          <Typography sx={{ color: "grey.200", fontSize: 12, fontWeight: 600 }}>
            Health feed stale — no update from alvin-vitals. Showing greyed, not
            live status.
          </Typography>
        </Box>
      ) : null}

      {/* Scrollable services + matrix */}
      <Box sx={{ maxHeight, overflowY: "auto", pr: 0.5 }}>
        <Stack spacing={1}>
          <ServicesGrid
            services={document.services || []}
            stale={stale}
            onSelect={setSelection}
            headerRight={
              <Typography
                sx={{
                  color: stale ? "#ffb300" : "grey.500",
                  fontSize: 11,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                updated {ageLabel}
              </Typography>
            }
          />
          <HealthMatrix
            paths={document.paths || []}
            stale={stale}
            onSelect={setSelection}
          />
        </Stack>
      </Box>

      <HealthDetailDrawer
        selection={selection}
        stale={stale}
        now={now}
        onClose={() => setSelection(null)}
      />
    </Box>
  );
}
