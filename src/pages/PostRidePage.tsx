import { useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Alert,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { createRide } from "../api/rides";

export default function PostRidePage() {
  const navigate = useNavigate();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await createRide({ origin, destination, departureTime });
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Could not create ride");
    } finally {
      setLoading(false);
    }
  }

  // Minimum datetime is now (for the picker)
  const minDateTime = new Date(Date.now() + 5 * 60 * 1000)
    .toISOString()
    .slice(0, 16);

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} mb={1}>
        Post a Ride
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        Fill in the details and passengers can request a seat.
      </Typography>
      <Paper elevation={2} sx={{ p: 4 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 3 }}
        >
          <TextField
            label="Departing from"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            required
            fullWidth
            placeholder="e.g. Campus North"
          />
          <TextField
            label="Going to"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
            fullWidth
            placeholder="e.g. Downtown"
          />
          <TextField
            label="Departure time"
            type="datetime-local"
            value={departureTime}
            onChange={(e) => setDepartureTime(e.target.value)}
            required
            fullWidth
            inputProps={{ min: minDateTime }}
            InputLabelProps={{ shrink: true }}
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            fullWidth
          >
            {loading ? "Posting..." : "Post ride"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
