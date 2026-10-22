import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Shield, LogIn } from "lucide-react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useAuth } from "../context/useAuth";
import ThemeToggle from "../components/common/ThemeToggle";
export default function LoginPage() {
  const { token, loading, login, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  if (!loading && token)
    return <Navigate to={location.state?.from || "/"} replace />;
  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    const ok = await login(email, password);
    setSubmitting(false);
    if (ok)
      navigate(location.state?.from || "/", {
        replace: true,
      });
  }
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        px: 2,
        py: 10,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          right: 16,
          top: 16,
        }}
      >
        <ThemeToggle />
      </Box>
      <Box
        sx={{
          width: "100%",
          maxWidth: 400,
        }}
      >
        <Stack
          spacing={1}
          sx={{
            alignItems: "center",
            mb: 4,
          }}
        >
          <Box
            component="span"
            sx={{
              display: "inline-flex",
              color: "secondary.main",
            }}
          >
            <Shield size={40} />
          </Box>
          <Typography
            component="h1"
            variant="h5"
            sx={{
              fontWeight: 700,
            }}
          >
            DH_MIL
          </Typography>
          <Typography
            sx={{
              color: "text.secondary",
            }}
          >
            Poste de contrôle — Drone Hybride
          </Typography>
        </Stack>
        <Paper
          component="form"
          onSubmit={handleSubmit}
          variant="outlined"
          sx={{
            p: 3,
          }}
        >
          <Stack spacing={3}>
            <TextField
              id="email"
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              fullWidth
            />
            <TextField
              id="password"
              label="Mot de passe"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              fullWidth
            />
            {error && <Alert severity="error">{error}</Alert>}
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              startIcon={
                submitting ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <LogIn size={18} />
                )
              }
              fullWidth
            >
              Se connecter
            </Button>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}
