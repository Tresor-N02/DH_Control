import { Typography } from "@mui/material";
import Card from "./Card";
import CardHeader from "./CardHeader";
import CardBody from "./CardBody";
import { useDrone } from "../../context/useDrone";
export default function TelemetryCard({ title, icon, children }) {
  const { telemetryStale } = useDrone();
  return (
    <Card
      sx={{
        height: "100%",
        fontVariantNumeric: "tabular-nums",
        borderStyle: telemetryStale ? "dashed" : "solid",
      }}
    >
      <CardHeader title={title} icon={icon} />
      <CardBody>{children}</CardBody>
    </Card>
  );
}
export function MetricValue({ value, unit, color = "text.primary" }) {
  return (
    <Typography
      component="p"
      sx={{
        color: color,
        fontSize: "2.25rem",
        fontWeight: 600,
        lineHeight: 1.3,
        letterSpacing: "-0.025em",
      }}
    >
      {value}
      {unit && (
        <Typography
          component="span"
          variant="body2"
          sx={{
            color: "text.secondary",
            ml: 1,
          }}
        >
          {unit}
        </Typography>
      )}
    </Typography>
  );
}
