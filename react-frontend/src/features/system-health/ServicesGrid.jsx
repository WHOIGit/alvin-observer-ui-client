import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import StatusBadge from "./StatusBadge";
import { STATUS, statusMeta } from "./healthUi";

// "System services" card grid. Greyed to unknown when stale. `headerRight`
// renders in the header row (the panel puts "updated Xs ago" there).
export default function ServicesGrid({ services = [], stale = false, onSelect, headerRight }) {
  if (!services.length) return null;

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: "grey.400",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          System services
        </Typography>
        {headerRight}
      </Box>
      <Box
        sx={{
          mt: 0.5,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(176px, 1fr))",
          gap: 0.5,
        }}
      >
        {services.map((svc) => {
          const status = stale ? STATUS.UNKNOWN : svc.status;
          const meta = statusMeta(status);
          return (
            <Box
              key={svc.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelect && onSelect({ service: svc })}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect && onSelect({ service: svc });
                }
              }}
              sx={{
                cursor: "pointer",
                px: 1,
                py: 0.6,
                borderRadius: 1,
                bgcolor: "#0d141b",
                border: `1px solid ${meta.color}55`,
                borderLeft: `4px solid ${meta.color}`,
                "&:hover": { bgcolor: "#111a23" },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 0.5,
                }}
              >
                <Typography
                  sx={{
                    color: "grey.100",
                    fontSize: 12,
                    fontWeight: 700,
                    lineHeight: 1.2,
                    overflowWrap: "anywhere",
                  }}
                >
                  {svc.label || svc.id}
                </Typography>
                <StatusBadge status={status} variant="light" />
              </Box>
              {svc.detail ? (
                <Typography
                  sx={{ color: "grey.400", fontSize: 11, lineHeight: 1.25, overflowWrap: "anywhere" }}
                >
                  {svc.detail}
                </Typography>
              ) : null}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
