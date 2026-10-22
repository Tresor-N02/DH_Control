import MuiCardHeader from "@mui/material/CardHeader";
import Box from "@mui/material/Box";
export default function CardHeader({ title, icon: Icon, right }) {
  return (
    <MuiCardHeader
      title={title}
      avatar={
        Icon ? (
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 2,
              bgcolor: "action.hover",
              color: "secondary.main",
              display: "grid",
              placeItems: "center",
            }}
          >
            <Icon size={18} />
          </Box>
        ) : undefined
      }
      action={right}
      slotProps={{
        title: {
          component: "h3",
          variant: "subtitle1",
          sx: { lineHeight: 1.4 },
        },
      }}
    />
  );
}
