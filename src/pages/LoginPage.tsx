import { useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Alert,
  Paper,
  Link as MuiLink,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/rides";
import { useAuth } from "../context/AuthContext";
import styles from "./LoginPage.module.css";

export default function LoginPage() {
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { user, token } = await login(email, password);
      setAuth(user, token);
      navigate("/rides");
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container maxWidth="xs">
      <Box className={styles.container}>
        <Paper elevation={3} className={styles.paper}>
          <Typography variant="h5" className={styles.title}>
            Log in to RideAlong
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              fullWidth
            >
              {loading ? "Logging in..." : "Log in"}
            </Button>
          </Box>
          <Typography variant="h5" className={styles.title}>
            Don't have an account?{" "}
            <MuiLink component={Link} to="/signup">
              Sign up
            </MuiLink>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}