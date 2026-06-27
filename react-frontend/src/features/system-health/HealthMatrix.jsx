import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import StatusBadge from "./StatusBadge";
import {
  STATUS,
  buildRowCatalog,
  groupPathsByStation,
} from "./healthUi";

const HEADER_BG = "#0d141b";
const BORDER = "1px solid rgba(255,255,255,0.10)";
const ROW_LABEL_W = 132;
const COL_W = 88;

// Station-grouped status matrix: columns = paths by station then kind, rows =
// probe ladder + class rows. When `stale`, every cell + light greys to unknown.
export default function HealthMatrix({ paths = [], stale = false, onSelect }) {
  const groups = groupPathsByStation(paths);
  const orderedPaths = groups.flatMap((g) => g.paths);
  const rows = buildRowCatalog(orderedPaths);

  if (!orderedPaths.length) {
    return (
      <Typography variant="body2" sx={{ color: "grey.500", p: 2 }}>
        No device paths in snapshot.
      </Typography>
    );
  }

  const cellStatus = (s) => (stale ? STATUS.UNKNOWN : s);

  return (
    <Box sx={{ overflowX: "auto", border: BORDER, borderRadius: 1 }}>
      <Box
        component="table"
        sx={{
          borderCollapse: "separate",
          borderSpacing: 0,
          width: "max-content",
          minWidth: "100%",
        }}
      >
        <Box component="thead">
          {/* Station band row */}
          <Box component="tr">
            <Box
              component="th"
              sx={{
                position: "sticky",
                left: 0,
                zIndex: 3,
                bgcolor: HEADER_BG,
                borderBottom: BORDER,
                borderRight: BORDER,
                width: ROW_LABEL_W,
                minWidth: ROW_LABEL_W,
              }}
            />
            {groups.map((g) => (
              <Box
                key={g.station}
                component="th"
                colSpan={g.paths.length}
                sx={{
                  bgcolor: HEADER_BG,
                  borderBottom: BORDER,
                  borderLeft: BORDER,
                  px: 1,
                  py: 0.5,
                  textAlign: "left",
                  color: "grey.300",
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                {g.label}
              </Box>
            ))}
          </Box>

          {/* Per-path header: label + worst-of rollup light */}
          <Box component="tr">
            <Box
              component="th"
              sx={{
                position: "sticky",
                left: 0,
                zIndex: 3,
                bgcolor: HEADER_BG,
                borderBottom: BORDER,
                borderRight: BORDER,
                px: 1,
                py: 0.5,
                textAlign: "left",
                color: "grey.400",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              check
            </Box>
            {orderedPaths.map((p) => (
              <Box
                key={p.id}
                component="th"
                title={`${p.label}${p.in_use ? "" : " (not in use)"}`}
                sx={{
                  bgcolor: HEADER_BG,
                  borderBottom: BORDER,
                  borderLeft: BORDER,
                  px: 0.5,
                  py: 0.5,
                  width: COL_W,
                  minWidth: COL_W,
                  maxWidth: COL_W,
                  verticalAlign: "bottom",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 0.4,
                  }}
                >
                  <StatusBadge status={cellStatus(p.rollup)} variant="light" />
                  <Typography
                    sx={{
                      color: p.in_use ? "grey.200" : "grey.500",
                      fontSize: 10,
                      lineHeight: 1.15,
                      textAlign: "center",
                      fontWeight: 600,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {p.label}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        <Box component="tbody">
          {rows.map((row) => (
            <Box component="tr" key={row.id}>
              <Box
                component="th"
                scope="row"
                sx={{
                  position: "sticky",
                  left: 0,
                  zIndex: 2,
                  bgcolor: "#0b1117",
                  borderBottom: BORDER,
                  borderRight: BORDER,
                  px: 0.75,
                  py: 0.4,
                  textAlign: "left",
                  color: "grey.300",
                  fontSize: 11,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                {row.label}
              </Box>
              {orderedPaths.map((p) => {
                const check = (p.checks || []).find((c) => c.id === row.id);
                return (
                  <Box
                    component="td"
                    key={`${p.id}:${row.id}`}
                    sx={{
                      borderBottom: BORDER,
                      borderLeft: BORDER,
                      p: 0.4,
                      width: COL_W,
                      minWidth: COL_W,
                    }}
                  >
                    {check ? (
                      <Box
                        role="button"
                        tabIndex={0}
                        onClick={() => onSelect && onSelect({ path: p, check })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onSelect && onSelect({ path: p, check });
                          }
                        }}
                        title={check.detail || check.label}
                        sx={{ cursor: "pointer" }}
                      >
                        <StatusBadge status={cellStatus(check.status)} variant="cell" />
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          textAlign: "center",
                          color: "grey.700",
                          fontSize: 12,
                        }}
                      >
                        –
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
