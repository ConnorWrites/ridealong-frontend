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
  const { setUser } = useAuth();
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
      const { user } = await login(email, password);
      setUser(user);
      navigate("/rides");
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container maxWidth="sm" className={styles.container}>
      <Box className={styles.hero}>
        <Paper elevation={3} className={styles.paper}>
          <Typography variant="h5" className={styles.title}>
            Log in to RideAlong
          </Typography>
          {error && <Alert severity="error" className={styles.errorAlert}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit} className={styles.form}>
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
            <Button type="submit" variant="contained" size="large" disabled={loading} fullWidth>
              {loading ? "Logging in..." : "Log in"}
            </Button>
          </Box>
          <Typography variant="body2" className={styles.actionsText}>
            Don't have an account?{" "}
            <MuiLink component={Link} to="/signup">Sign up</MuiLink>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}