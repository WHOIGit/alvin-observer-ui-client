import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import useHealthSnapshot from "./useHealthSnapshot";
import HealthMatrix from "./HealthMatrix";
import ServicesGrid from "./ServicesGrid";
import HealthDetailDrawer from "./HealthDetailDrawer";
import StatusBadge from "./StatusBadge";
import { STATUS, formatAge, isFeedStale, statusMeta } from "./healthUi";

// System health view: overall banner + "updated Xs ago", station-grouped
// matrix, services grid, and cell detail drawer. A stale feed greys everything.
export default function SystemHealthPanel({ maxHeight = 520 }) {
  const { document, receivedAt } = useHealthSnapshot();
  const [selection, setSelection] = useState(null);

  // Tick once a second so "updated Xs ago" and staleness stay live.
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (!document) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography sx={{ color: "grey.400" }}>
          Waiting for system health feed…
        </Typography>
      </Box>
    );
  }

  const stale = isFeedStale(receivedAt, now);
  const overall = stale ? STATUS.UNKNOWN : document.overall;
  const overallMeta = statusMeta(overall);
  const ageLabel = formatAge(document.generated_at, now);
  const dive = document.dive || {};

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
      {/* Overall banner */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 1.5,
          py: 1,
          borderRadius: 1,
          bgcolor: `${overallMeta.color}1f`,
          border: `1px solid ${overallMeta.color}`,
        }}
      >
        <StatusBadge status={overall} variant="light" />
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography sx={{ color: "grey.50", fontWeight: 800, fontSize: 14, lineHeight: 1.1 }}>
            System {overallMeta.label}
          </Typography>
          <Typography sx={{ color: "grey.400", fontSize: 11 }}>
            {[dive.cruise_name, dive.dive_name].filter(Boolean).join(" · ") || "—"}
          </Typography>
        </Box>
        <Typography
          sx={{ color: stale ? "#ffb300" : "grey.400", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}
        >
          updated {ageLabel}
        </Typography>
      </Box>

      {/* Stale / dropped feed banner */}
      {stale ? (
        <Box
          sx={{
            px: 1.5,
            py: 0.75,
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

      {/* Scrollable matrix + services */}
      <Box sx={{ maxHeight, overflowY: "auto", pr: 0.5 }}>
        <Stack spacing={1.25}>
          <ServicesGrid
            services={document.services || []}
            stale={stale}
            onSelect={setSelection}
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
