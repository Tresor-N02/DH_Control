import Box from "@mui/material/Box";
export default function CardBody({ children, sx = [], ...props }) {
  return (
    <Box {...props} sx={[{ p: 2.5 }, ...(Array.isArray(sx) ? sx : [sx])]}>
      {children}
    </Box>
  );
}
