import { Box, Typography } from "@mui/material";
export default function DetectionBox({
  left,
  top,
  width,
  height,
  label,
  color = "#a3e635",
}) {
  return (
    <Box
      sx={{
        position: "absolute",
        left,
        top,
        width,
        height,
        border: "2px solid",
        borderColor: color,
        pointerEvents: "none",
      }}
    >
      <Typography
        variant="caption"
        sx={{
          position: "absolute",
          bottom: "100%",
          left: -2,
          mb: 0.5,
          borderRadius: 1,
          bgcolor: color,
          color: "#000",
          px: 1,
          py: 0.5,
          fontWeight: 700,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}
