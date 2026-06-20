import { useEffect, useRef } from "react";
import { Box, TextField } from "@mui/material";
import { PIN_LENGTH } from "../utils/profilePasscode";

interface PinInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  error?: boolean;
  idPrefix?: string;
}

export function PinInput({
  value,
  onChange,
  disabled = false,
  autoFocus = false,
  error = false,
  idPrefix = "pin",
}: PinInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: PIN_LENGTH }, (_, i) => value[i] ?? "");

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  const updateAt = (index: number, nextChar: string) => {
    const chars = digits.slice();
    chars[index] = nextChar;
    onChange(chars.join("").slice(0, PIN_LENGTH));
    if (nextChar && index < PIN_LENGTH - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  const handleChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    updateAt(index, digit);
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement | HTMLDivElement>
  ) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        updateAt(index, "");
      } else if (index > 0) {
        refs.current[index - 1]?.focus();
        updateAt(index - 1, "");
      }
      e.preventDefault();
      return;
    }

    if (e.key === "ArrowLeft" && index > 0) {
      refs.current[index - 1]?.focus();
      e.preventDefault();
      return;
    }

    if (e.key === "ArrowRight" && index < PIN_LENGTH - 1) {
      refs.current[index + 1]?.focus();
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, PIN_LENGTH);
    if (!pasted) return;
    onChange(pasted);
    const focusIndex = Math.min(pasted.length, PIN_LENGTH - 1);
    refs.current[focusIndex]?.focus();
  };

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1,
        justifyContent: "center",
      }}
      onPaste={handlePaste}
    >
      {digits.map((digit, index) => (
        <TextField
          key={index}
          inputRef={(el) => {
            refs.current[index] = el;
          }}
          value={digit}
          disabled={disabled}
          error={error}
          slotProps={{
            htmlInput: {
              id: `${idPrefix}-${index}`,
              inputMode: "numeric",
              pattern: "[0-9]*",
              maxLength: 1,
              "aria-label": `Digit ${index + 1} of ${PIN_LENGTH}`,
              style: {
                textAlign: "center",
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: 2,
                padding: "10px 0",
              },
            },
          }}
          sx={{
            width: 52,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
          }}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </Box>
  );
}
