import React from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import StatusBadge from "./StatusBadge";
import { STATUS, formatAge } from "./healthUi";

function Field({ label, children }) {
  if (children === null || children === undefined || children === "") return null;
  return (
    <Box sx={{ mb: 1.25 }}>
      <Typography
        sx={{
          color: "grey.500",
          fontSize: 10,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        {label}
      </Typography>
      <Typography sx={{ color: "grey.100", fontSize: 13, mt: 0.25, overflowWrap: "anywhere" }}>
        {children}
      </Typography>
    </Box>
  );
}

// Detail drawer for a clicked matrix cell or service card.
// `selection`: { path, check } | { service } | null.
export default function HealthDetailDrawer({ selection, stale = false, now = Date.now(), onClose }) {
  const open = Boolean(selection);
  const isService = Boolean(selection && selection.service);
  const item = selection ? (isService ? selection.service : selection.check) : null;
  const path = selection ? selection.path : null;

  const status = item ? (stale ? STATUS.UNKNOWN : item.status) : STATUS.UNKNOWN;
  const title = isService
    ? selection?.service?.label || selection?.service?.id
    : item?.label || item?.id;
  const subtitle = !isService && path ? path.label : null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { bgcolor: "#0b1117", borderLeft: "1px solid rgba(255,255,255,0.12)", width: 340 } }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            {subtitle ? (
              <Typography sx={{ color: "grey.500", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
                {subtitle}
              </Typography>
            ) : null}
            <Typography sx={{ color: "grey.50", fontSize: 16, fontWeight: 700, overflowWrap: "anywhere" }}>
              {title}
            </Typography>
          </Box>
          <IconButton aria-label="Close detail" size="small" onClick={onClose} sx={{ color: "grey.300" }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ mt: 1, mb: 1.5 }}>
          <StatusBadge status={status} variant="chip" />
          {stale && item && item.status !== STATUS.UNKNOWN ? (
            <Typography sx={{ color: "grey.500", fontSize: 11, mt: 0.5 }}>
              feed stale — last reported "{item.status}"
            </Typography>
          ) : null}
        </Box>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.12)", mb: 1.5 }} />

        <Field label="Detail">{item?.detail}</Field>
        <Field label="Updated">{item?.checked_at ? formatAge(item.checked_at, now) : null}</Field>
        {item && item.value !== null && item.value !== undefined ? (
          <Field label="Value">{String(item.value)}</Field>
        ) : null}
        {isService ? <Field label="Source">{selection?.service?.source}</Field> : null}
        {!isService && path?.endpoint ? (
          <Field label="Endpoint">
            {`${path.endpoint.host}:${path.endpoint.port} (${path.endpoint.proto})`}
          </Field>
        ) : null}
        <Field label="Remediation">{item?.remediation}</Field>
      </Box>
    </Drawer>
  );
}
