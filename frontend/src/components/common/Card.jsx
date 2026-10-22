import MuiCard from "@mui/material/Card";
export default function Card({ children, sx = [], ...props }) {
  return (
    <MuiCard
      variant="outlined"
      {...props}
      sx={[
        {
          overflow: "hidden",
          minWidth: 0,
          boxShadow: "0 2px 6px rgb(0 0 0 / 0.05)",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </MuiCard>
  );
}
