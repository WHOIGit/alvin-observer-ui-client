import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  IconButton,
  Tooltip,
} from "@mui/material";
import bombIcon from "../../images/bomb.png";

const RESTART_URL = `https://${window.location.hostname}/restart`;

export default function RestartButton() {
  const [open, setOpen] = React.useState(false);
  const [restarting, setRestarting] = React.useState(false);

  const handleConfirm = React.useCallback(() => {
    setRestarting(true);
    fetch(RESTART_URL, { method: "GET", mode: "no-cors" })
      .catch(() => {})
      .finally(() => {
        window.location.reload();
      });
  }, []);

  return (
    <>
      <Tooltip title="Restart">
        <IconButton
          color="inherit"
          aria-label="Restart"
          onClick={() => setOpen(true)}
          sx={{ ml: 1.5, flexShrink: 0 }}
        >
          <img src={bombIcon} alt="" width={24} height={24} />
        </IconButton>
      </Tooltip>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Restart imaging server?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={restarting}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} color="error" disabled={restarting}>
            Restart
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
