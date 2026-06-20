import { Typography } from "@mui/material";
import type { ReactNode } from "react";
import type { SxProps, Theme } from "@mui/material/styles";

export function FieldLabel({
  children,
  sx,
}: {
  children: ReactNode;
  sx?: SxProps<Theme>;
}) {
  return (
    <Typography
      sx={{
        fontSize: 11,
        fontWeight: 600,
        color: "text.secondary",
        mb: 0.5,
        letterSpacing: "0.02em",
        ...sx,
      }}
    >
      {children}
    </Typography>
  );
}
