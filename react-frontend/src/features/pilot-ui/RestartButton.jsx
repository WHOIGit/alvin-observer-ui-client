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

export default function RestartButton({ label = "Restart" }) {
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
      <Tooltip title={label}>
        <IconButton
          color="inherit"
          aria-label={label}
          // Open on press: pilots used to the old hold-to-fire button would
          // otherwise wait on a release that does nothing.
          onPointerDown={(event) => {
            // Primary button / first touch only: a right-click or a second
            // finger must not raise a restart prompt.
            if (event.button > 0 || event.isPrimary === false) return;
            event.preventDefault();
            setOpen(true);
          }}
          sx={{ ml: 1.5, flexShrink: 0 }}
        >
          <img src={bombIcon} alt="" width={24} height={24} />
        </IconButton>
      </Tooltip>
      {/* Backdrop clicks are ignored so the press that opened this cannot
          also dismiss it on release; Cancel and Escape still close. */}
      <Dialog
        open={open}
        onClose={(_event, reason) => {
          if (reason !== "backdropClick") setOpen(false);
        }}
      >
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
