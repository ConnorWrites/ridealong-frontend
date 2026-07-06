import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Container,
  TextField,
  Typography,
  Alert,
  Chip,
  Grid,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PlaceIcon from "@mui/icons-material/Place";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import { listRides, requestRide } from "../api/rides";
import { useAuth } from "../context/AuthContext";
import type { Ride } from "../types";
import styles from "./RidesPage.module.css";

export default function RidesPage() {
  const { user } = useAuth();
  const [rides, setRides] = useState<Ride[]>([]);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  async function fetchRides() {
    setLoading(true);
    setError("");
    try {
      const data = await listRides({ origin, destination });
      setRides(data);
    } catch {
      setError("Could not load rides");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRides();
  }, []);

  async function handleRequest(rideId: string) {
    setRequestingId(rideId);
    try {
      await requestRide(rideId);
      setSuccessId(rideId);
      fetchRides();
    } catch (err: any) {
      setError(err.response?.data?.error || "Could not request ride");
    } finally {
      setRequestingId(null);
    }
  }

  function hasRequested(ride: Ride) {
    return ride.requests.some((r) => r.userId === user?.id);
  }

  function isAccepted(ride: Ride) {
    return ride.requests.some((r) => r.status === "ACCEPTED");
  }

  return (
    <Container maxWidth="md" className={styles.container}>
      <Typography
        variant="h5"
        sx={{ fontWeight: 600, mb: 1, textAlign: "center" }}
      >
        Available Rides
      </Typography>

      <Typography
        variant="body1"
        sx={{ mb: 3, textAlign: "center", color: "text.secondary" }}
      >
        Browse upcoming rides and request a seat.
      </Typography>

      {/* Search filters */}
      <Box className={styles.search}>
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

        <Button variant="outlined" onClick={fetchRides}>
          Search
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : rides.length === 0 ? (
        <Typography
          variant="body1"
          sx={{ textAlign: "center", color: "text.secondary" }}
        >
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
              <Grid key={ride.id} size={{ xs: 12, sm: 6 }}>
                <Card
                  variant="outlined"
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <PlaceIcon fontSize="small" color="primary" />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {ride.origin} → {ride.destination}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mt: 1,
                      }}
                    >
                      <AccessTimeIcon fontSize="small" color="action" />
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary" }}
                      >
                        {new Date(ride.departureTime).toLocaleString()}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mt: 1,
                      }}
                    >
                      <PersonIcon fontSize="small" color="action" />
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary" }}
                      >
                        {ride.driver.name || ride.driver.email}
                      </Typography>
                    </Box>

                    {accepted && (
                      <Chip
                        label="Seat taken"
                        color="warning"
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    )}

                    {successId === ride.id && (
                      <Chip
                        label="Requested!"
                        color="success"
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    )}
                  </CardContent>

                  <CardActions>
                    {!isOwn && user?.role === "PASSENGER" && (
                      <Button
                        size="small"
                        variant="contained"
                        disabled={
                          requested ||
                          accepted ||
                          requestingId === ride.id
                        }
                        onClick={() => handleRequest(ride.id)}
                      >
                        {requestingId === ride.id
                          ? "Requesting..."
                          : requested
                          ? "Already requested"
                          : "Request seat"}
                      </Button>
                    )}

                    {isOwn && (
                      <Chip label="Your ride" variant="outlined" size="small" />
                    )}
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
}