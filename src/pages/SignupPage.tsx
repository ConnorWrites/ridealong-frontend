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
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../api/rides";
import { useAuth } from "../context/AuthContext";
import styles from "./SignupPage.module.css";

export default function SignupPage() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"DRIVER" | "PASSENGER">("PASSENGER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const { user } = await signup(email, password, name, role);
      setUser(user);
      navigate("/rides");
    } catch (err: any) {
      setError(err.response?.data?.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container maxWidth="xs" className={styles.container}>
      <Box className={styles.hero}>
        <Paper elevation={3} className={styles.paper}>
          <Typography variant="h5" className={styles.title}>
            Join RideAlong
          </Typography>
          {error && <Alert severity="error" className={styles.errorAlert}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit} className={styles.form}>
            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
            />
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
              helperText="At least 8 characters"
            />
            <Box>
              <Typography variant="body2" className={styles.roleLabel} color="text.secondary">
                I want to...
              </Typography>
              <ToggleButtonGroup
                value={role}
                exclusive
                onChange={(_, val) => val && setRole(val)}
                fullWidth
              >
                <ToggleButton value="PASSENGER">Find a ride</ToggleButton>
                <ToggleButton value="DRIVER">Offer rides</ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <Button type="submit" variant="contained" size="large" disabled={loading} fullWidth>
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </Box>
          <Typography  variant="body2" className={styles.actionsText}>
            Already have an account?{" "}
            <MuiLink component={Link} to="/login">Log in</MuiLink>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}