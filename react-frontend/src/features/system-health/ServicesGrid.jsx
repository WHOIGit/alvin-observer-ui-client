import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import StatusBadge from "./StatusBadge";
import { STATUS, statusMeta } from "./healthUi";

// "System services" card grid below the matrix. Greyed to unknown when stale.
export default function ServicesGrid({ services = [], stale = false, onSelect }) {
  if (!services.length) return null;

  return (
    <Box>
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
      <Box
        sx={{
          mt: 0.75,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 0.75,
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
                p: 1,
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
                    overflowWrap: "anywhere",
                  }}
                >
                  {svc.label || svc.id}
                </Typography>
                <StatusBadge status={status} variant="light" />
              </Box>
              {svc.detail ? (
                <Typography
                  sx={{ color: "grey.400", fontSize: 11, mt: 0.25, overflowWrap: "anywhere" }}
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
