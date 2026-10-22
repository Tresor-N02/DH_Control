import { CircularProgress, Stack, Typography } from "@mui/material";
export default function PageLoading({ children = "Chargement…" }) {
  return (
    <Stack
      role="status"
      spacing={2}
      sx={{
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        bgcolor: "background.default",
        color: "text.primary",
        p: 3,
      }}
    >
      <CircularProgress aria-label="Chargement" />
      <Typography>{children}</Typography>
    </Stack>
  );
}
