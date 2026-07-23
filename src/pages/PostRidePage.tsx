import { useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Alert,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { createRide } from "../api/rides";
import AppSnackbar from "../components/AppSnackbar";
import type { AlertColor } from "@mui/material";
import styles from "./PostRidePage.module.css";

export default function PostRidePage() {
  const navigate = useNavigate();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [availableSeats, setAvailableSeats] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success" as AlertColor,
      });

  function showSnackbar(message: string, severity: AlertColor = "success") {
          setSnackbar({
            open: true,
            message, 
            severity,
          });
        }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await createRide({ origin, destination, departureTime, availableSeats });
      navigate("/dashboard");
    } catch (err: any) {
      const message = err.response?.data?.error || "Could not create the ride.";
      setError(message);
      showSnackbar(message, "error");
    } finally {
      setLoading(false);
    }
  }

  // Minimum datetime is now (for the picker)
  const minDateTime = new Date(Date.now() + 5 * 60 * 1000)
    .toISOString()
    .slice(0, 16);

  return (
    <div className={styles.hero}>
      <div className={styles.overlay} />
      <div className={styles.content}>
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" >
        Post a Ride
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{mb: 3}}>
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
            slotProps={{ htmlInput: { 
              min: minDateTime,
             }, 
            inputLabel: {
               shrink: true, 
            },
           }}
          />
          <FormControl fullWidth>
            <InputLabel id="available-seats-label">Available seats</InputLabel>
            <Select
              labelId="available-seats-label"
              value={availableSeats}
              label={"Available seats"}
              onChange={(e) => setAvailableSeats(Number(e.target.value))}
              required
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((seat) => (
                <MenuItem key={seat} value={seat}>
                  {seat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            fullWidth
          >
            {loading ? (<CircularProgress size={20} color="inherit" />
            ) : (
              "Post ride"
            )}
          </Button>
        </Box>
      </Paper>
      <AppSnackbar
            open={snackbar.open}
            message={snackbar.message}
            severity={snackbar.severity}
            onClose={() =>
              setSnackbar((prev) => ({
                ...prev,
                open: false,
              }))
            }
            />
    </Container>
    </div>
    </div>
  );
}