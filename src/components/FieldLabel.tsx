import { Typography } from "@mui/material";
import type { ReactNode } from "react";

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <Typography
      sx={{
        fontSize: 11,
        fontWeight: 600,
        color: "text.secondary",
        mb: 0.5,
        letterSpacing: "0.02em",
      }}
    >
      {children}
    </Typography>
  );
}
