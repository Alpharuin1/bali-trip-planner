import { useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { PinInput } from "./PinInput";
import { isValidProfilePin } from "../utils/profilePasscode";

interface ProfileUnlockDialogProps {
  open: boolean;
  profileName: string;
  verifying?: boolean;
  onClose: () => void;
  onUnlock: (pin: string) => Promise<boolean>;
}

export function ProfileUnlockDialog({
  open,
  profileName,
  verifying = false,
  onClose,
  onUnlock,
}: ProfileUnlockDialogProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setPin("");
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!isValidProfilePin(pin)) {
      setError("Enter the 4-digit passcode.");
      return;
    }

    setError(null);
    const ok = await onUnlock(pin);
    if (!ok) {
      setError("Incorrect passcode. Try again.");
      setPin("");
      return;
    }

    setPin("");
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <LockOutlinedIcon fontSize="small" />
        Unlock {profileName}&apos;s plan
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
          This personal plan is protected. Enter the 4-digit passcode to view it.
        </Typography>
        <PinInput
          value={pin}
          onChange={(next) => {
            setPin(next);
            if (error) setError(null);
          }}
          autoFocus
          disabled={verifying}
          error={!!error}
          idPrefix="unlock-pin"
        />
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={verifying}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={!isValidProfilePin(pin) || verifying}
          onClick={() => void handleSubmit()}
        >
          {verifying ? "Checking…" : "Unlock"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
