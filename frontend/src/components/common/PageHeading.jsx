import { Stack, Typography } from "@mui/material";
export default function PageHeading({ title, description, eyebrow, action }) {
  return (
    <Stack
      direction={{
        xs: "column",
        sm: "row",
      }}
      sx={{
        alignItems: {
          sm: "flex-end",
        },
        justifyContent: "space-between",
        gap: 2,
      }}
    >
      <Stack spacing={1}>
        {eyebrow && (
          <Typography
            variant="overline"
            sx={{
              color: "secondary.main",
              fontWeight: 600,
            }}
          >
            {eyebrow}
          </Typography>
        )}
        <Typography
          component="h2"
          variant="h4"
          sx={{
            fontWeight: 700,
            fontSize: {
              xs: "1.75rem",
              md: "2rem",
            },
            letterSpacing: "-0.025em",
          }}
        >
          {title}
        </Typography>
        {description && (
          <Typography
            sx={{
              color: "text.secondary",
              maxWidth: 680,
            }}
          >
            {description}
          </Typography>
        )}
      </Stack>
      {action}
    </Stack>
  );
}
