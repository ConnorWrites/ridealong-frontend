//Browse Rides Page
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActionArea,
  Container,
  TextField,
  Typography,
  Alert,
  Chip,
  Grid,
  InputAdornment,
  CircularProgress,
  Paper,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PlaceIcon from "@mui/icons-material/Place";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import { useNavigate } from "react-router-dom";
import { listRides } from "../api/rides";
import { useAuth } from "../context/AuthContext";
import type { Ride } from "../types";
import styles from "./RidesPage.module.css";
import AppSnackbar from "../components/AppSnackbar";
import type { AlertColor } from "@mui/material";

export default function RidesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rides, setRides] = useState<Ride[]>([]);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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

  async function fetchRides() {
    setLoading(true);
    setError("");
    try {
      const data = await listRides({ origin, destination });
      setRides(data);
    } catch {
      const message = "Could not load rides.";
      setError(message);
      showSnackbar(message, "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchRides(); }, []);

  function isAccepted(ride: Ride) {
    return ride.requests.some((r) => r.status === "ACCEPTED");
  }

  function hasRequested(ride: Ride) {
    return ride.requests.some((r) => 
      r.userId === user?.id &&
      r.status !== "CANCELLED"
  );
  }

  return (
    <div className={styles.hero}>
      <div className={styles.overlay} />
      <div className={styles.content}>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: "white" }}>
            Available Rides
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: "rgba(255,255,255,0.85)" }}>
            Click a ride to see the route and request a seat.
          </Typography>

          <Paper sx={{ p: 2, mb: 3, bgcolor: "rgba(255,255,255,0.92)", backdropFilter: "blur(6px)" }}>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
              <TextField
                label="From"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                size="small"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <TextField
                label="To"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                size="small"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <Button variant="outlined" onClick={fetchRides} disabled={loading}>
                { loading ? <CircularProgress size={18} /> : "Search" }
                </Button>
            </Box>
          </Paper>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
              <CircularProgress sx={{ color: "white" }} />
            </Box>
          ) : rides.length === 0 ? (
            <Typography sx={{ textAlign: "center", mt: 6, color: "white" }}>
              No upcoming rides found.{" "}
              {user?.role === "DRIVER" && "Why not post one?"}
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {rides.map((ride) => {
                const accepted = isAccepted(ride);
                const requested = hasRequested(ride);
                const isOwn = ride.driverId === user?.id;

                return (
                  <Grid size={{ xs: 12, sm: 6 }} key={ride.id}>
                    <Card
                      variant="outlined"
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        bgcolor: "rgba(255,255,255,0.92)",
                        backdropFilter: "blur(6px)",
                      }}
                    >
                      <CardActionArea onClick={() => navigate(`/rides/${ride.id}`)} sx={{ flexGrow: 1 }}>
                        <CardContent>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                            <PlaceIcon fontSize="small" color="primary" />
                            <Typography sx={{ fontWeight: 600 }}>
                              {ride.origin} → {ride.destination}
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                            <AccessTimeIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {new Date(ride.departureTime).toLocaleString()}
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <PersonIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {ride.driver.name || ride.driver.email}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Seats available: {ride.availableSeats - ride.bookedSeats} / {ride.availableSeats}
                            </Typography>
                          </Box>
                          <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
                            {accepted && <Chip label={`${ride.bookedSeats}/${ride.availableSeats} seats booked`} color="warning" size="small" />}
                            {requested && <Chip label="Requested" color="info" size="small" />}
                            {isOwn && <Chip label="Your ride" variant="outlined" size="small" />}
                          </Box>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Container>
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
      </div>
    </div>
  );
}