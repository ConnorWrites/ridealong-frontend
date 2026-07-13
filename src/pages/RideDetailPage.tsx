import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Typography,
  Alert,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PlaceIcon from "@mui/icons-material/Place";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import { getRide, requestRide } from "../api/rides";
import { geocode, getRoute } from "../api/maps";
import { useAuth } from "../context/AuthContext";
import RouteMap from "../components/RouteMap";
import type { Ride } from "../types";
import type { Coordinates, RouteGeoJSON } from "../api/maps";

export default function RideDetailPage() {
  const { rideId } = useParams<{ rideId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ride, setRide] = useState<Ride | null>(null);
  const [rideLoading, setRideLoading] = useState(true);
  const [rideError, setRideError] = useState("");

  const [origin, setOrigin] = useState<Coordinates | null>(null);
  const [destination, setDestination] = useState<Coordinates | null>(null);
  const [route, setRoute] = useState<RouteGeoJSON | null>(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState("");

  const [requesting, setRequesting] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [requested, setRequested] = useState(false);
  const [seatsRequested, setSeatsRequested] = useState(1);

  useEffect(() => {
    if (!rideId) return;
    setRideLoading(true);
    getRide(rideId)
      .then((data) => {
        setRide(data);
        const alreadyRequested = data.requests.some((r) => r.userId === user?.id);
        setRequested(alreadyRequested);
      })
      .catch(() => setRideError("Could not load ride"))
      .finally(() => setRideLoading(false));
  }, [rideId]);

  useEffect(() => {
    if (!ride) return;
    setMapLoading(true);
    setMapError("");

    Promise.all([geocode(ride.origin), geocode(ride.destination)])
      .then(([orig, dest]) => {
        setOrigin(orig);
        setDestination(dest);
        return getRoute(orig, dest);
      })
      .then((r) => setRoute(r))
      .catch(() => setMapError("Could not load map route for these locations"))
      .finally(() => setMapLoading(false));
  }, [ride]);

  async function handleRequest() {
    if (!rideId) return;
    setRequesting(true);
    setRequestError("");
    try {
      await requestRide(rideId, seatsRequested);
      setRequested(true);
    } catch (err: any) {
      setRequestError(err.response?.data?.error || "Could not request ride");
    } finally {
      setRequesting(false);
    }
  }

  const seatsRemaining = ride ? ride.availableSeats - ride.bookedSeats : 0;
  const isFull = seatsRemaining <= 0;
  const isOwn = ride?.driverId === user?.id;
  const isPassenger = user?.role === "PASSENGER";

  if (rideLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (rideError || !ride) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{rideError || "Ride not found"}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/rides")}
        sx={{ mb: 3 }}
      >
        Back to rides
      </Button>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Stack spacing={2}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PlaceIcon color="primary" />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {ride.origin} → {ride.destination}
            </Typography>
          </Box>

          <Divider />

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AccessTimeIcon color="action" />
            <Typography variant="body1">
              {new Date(ride.departureTime).toLocaleString()}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PersonIcon color="action" />
            <Typography variant="body1">
              Driver: {ride.driver.name || ride.driver.email}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body1">
              Seats available: {seatsRemaining} / {ride.availableSeats}
            </Typography>
          </Box>

          {!isOwn && isPassenger && !requested && !isFull && (
            <FormControl sx={{ width: 180 }}>
              <InputLabel id="seats-requested-label">Seats</InputLabel>
              <Select
                labelId="seats-requested-label"
                value={seatsRequested}
                onChange={(e) => setSeatsRequested(Number(e.target.value))}
              >
                {Array.from({ length: seatsRemaining }, (_, i) => i + 1).map(
                  (num) => (
                    <MenuItem key={num} value={num}>
                      {num}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>
          )}

          {isFull && (
            <Chip label="Ride full" color="warning" sx={{ alignSelf: "flex-start" }} />
          )}

          {requestError && <Alert severity="error">{requestError}</Alert>}

          {!isOwn && isPassenger && !isFull && (
            <Button
              variant="contained"
              size="large"
              disabled={requested || !!isFull || requesting}
              onClick={handleRequest}
              sx={{ alignSelf: "flex-start" }}
            >
              {requesting
                ? "Requesting..."
                : requested
                ? "Request sent"
                : "Request seat"}
            </Button>
          )}

          {isOwn && (
            <Chip label="Your ride" variant="outlined" sx={{ alignSelf: "flex-start" }} />
          )}
        </Stack>
      </Paper>

      {/* Map section */}
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Route
      </Typography>

      {mapLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : mapError ? (
        <Alert severity="warning">{mapError}</Alert>
      ) : origin && destination && route ? (
        <RouteMap origin={origin} destination={destination} route={route} />
      ) : null}
    </Container>
  );
}