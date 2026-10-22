import { useContext } from "react";
import { AuthContext } from "./contexts";
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth doit être utilisé dans son Provider");
  return context;
}
