import { useContext } from "react";
import { DroneContext } from "./contexts";
export function useDrone() {
  const context = useContext(DroneContext);
  if (!context) throw new Error("useDrone doit être utilisé dans son Provider");
  return context;
}
