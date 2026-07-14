import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

interface IdleWarningDialogProps {
  open: boolean;
  secondsRemaining: number;
  onStayLoggedIn: () => void;
  onLogoutNow: () => void;
}

export default function IdleWarningDialog({
  open,
  secondsRemaining,
  onStayLoggedIn,
  onLogoutNow,
}: IdleWarningDialogProps) {
  const [countdown, setCountdown] = useState(secondsRemaining);

  useEffect(() => {
    if (!open) return;
    setCountdown(secondsRemaining);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [open, secondsRemaining]);

  return (
    <Dialog open={open} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <AccessTimeIcon color="warning" />
        Still there?
      </DialogTitle>
      <DialogContent>
        <Typography>
          You've been inactive for a while. For your security, you'll be logged
          out in{" "}
          <Typography component="span" sx={{ fontWeight: 700, color: "warning.main" }}>
            {countdown} second{countdown !== 1 ? "s" : ""}
          </Typography>
          .
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button variant="outlined" color="error" onClick={onLogoutNow}>
          Log out now
        </Button>
        <Button variant="contained" onClick={onStayLoggedIn} autoFocus>
          Stay logged in
        </Button>
      </DialogActions>
    </Dialog>
  );
}
