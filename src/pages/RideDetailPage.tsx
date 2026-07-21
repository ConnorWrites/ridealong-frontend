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
  Checkbox,
  FormControlLabel,
  TextField
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PlaceIcon from "@mui/icons-material/Place";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import { getRide, requestRide, acceptRequest, rejectRequest } from "../api/rides";
import { geocode, getRoute } from "../api/maps";
import { useAuth } from "../context/AuthContext";
import RouteMap from "../components/RouteMap";
import type { Ride } from "../types";
import type { Coordinates, RouteGeoJSON } from "../api/maps";
import MessageThread from "../components/MessageThread";
import AppSnackbar from "../components/AppSnackbar";
import type { AlertColor } from "@mui/material";

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

  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  const [hasLuggage, setHasLuggage] = useState(false);
  const [notes, setNotes] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as AlertColor,
  });

  useEffect(() => {
    if (!rideId) return;
    setRideLoading(true);
    loadRide()
      .catch(() => setRideError("Could not load ride"))
      .finally(() => setRideLoading(false));
  }, [rideId, user?.id]);

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

    function showSnackbar(message: string, severity: AlertColor = "success") {
      setSnackbar({
        open: true,
        message, 
        severity,
      });
    }

async function loadRide() {
  if(!rideId) return;
  const data = await getRide(rideId);
  setRide(data);
  setRequested(
    data.requests.some((r) => r.userId === user?.id)
  );
}

  async function handleRequest() {
    if (!rideId) return;
    setRequesting(true);
    setRequestError("");
    try {
      await requestRide(rideId, seatsRequested, hasLuggage, notes);
      await loadRide();
      showSnackbar("Ride request sent!")
    } catch (err: any) {
      const message = err.response?.data?.error || "Could not request the ride";
      setRequestError(message);
      showSnackbar(message, "error");
    } finally {
      setRequesting(false);
    }
  }

  async function handleAccept(requestId: string) {
    setActionLoading(requestId);
    setActionError("");
    try {
    await acceptRequest(requestId);
    await loadRide();
    showSnackbar("Ride accepted!");
  } catch (err: any) {
      const message = err.response?.data?.error || "Could not accept the ride request";
      setActionError(message);
      showSnackbar(message, "error");
    }  finally {
    setActionLoading(null);
  }
}

async function handleReject(requestId: string) {
  setActionLoading(requestId);
  setActionError("");
  try {
    await rejectRequest(requestId);
    await loadRide();
    showSnackbar("Ride request rejected.")
  } catch (err: any) {
      const message = err.response?.data?.error || "Could not reject the ride request";
      setActionError(message);
      showSnackbar(message, "error");
    } finally {
    setActionLoading(null);
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer" }} onClick={() => navigate("/dashboard")} >
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
            <>
            <FormControl sx={{ width: 180 }}>
              <InputLabel id="seats-requested-label" shrink>Seats</InputLabel>
              <Select
                labelId="seats-requested-label"
                value={seatsRequested}
                label={"Seats"}
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
            <FormControlLabel
              control={<Checkbox checked={hasLuggage} onChange={(e) => setHasLuggage(e.target.checked)} /> }
                  label="I have luggage"
            />  
            <TextField
            label="Notes for driver (optional)"
            placeholder="e.g. 2 suitcases, wheelchair access needed"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline
            minRows={2}
            fullWidth
            />
            </>
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
              {requesting ? (
                <CircularProgress size={20} color="inherit" />
              ) : requested ? (
                 "Request submitted"
              ) : (
                 "Request seat"
                )}
            </Button>
          )}

          {isOwn && (
  <>
  {ride.requests.filter((r) => r.status === "PENDING").length > 0 && (
  <Box sx={{ mt: 2, width: "100%" }}>
    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
      Pending requests
    </Typography>
    {actionError && <Alert severity="error" sx={{ mb: 1 }}>{actionError}</Alert>}
    <Stack spacing={1}>
      {ride.requests
        .filter((r) => r.status === "PENDING")
        .map((r) => (
          <Paper key={r.id} variant="outlined" sx={{ p: 1.5 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {r.user?.name || r.user?.email}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display:"block" }}>
                  {r.seatsRequested} seat{r.seatsRequested > 1 ? "s" : ""} · requested{" "}
                  {new Date(r.createdAt).toLocaleDateString()}
                </Typography>
                {r.hasLuggage && (
                  <Chip label="Has luggage" size="small" sx={{ mt: 0.5, mr: 0.5 }} />
                )}
                {r.notes && (
                  <Typography variant="body2" sx={{ mt: 0.5, fontStyle: "italic" }}>
                    "{r.notes}"
                  </Typography>
                )}
              </Box>
              <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
                <Button
                  size="small"
                  variant="contained"
                  disabled={actionLoading === r.id}
                  onClick={() => handleAccept(r.id)}
                >
                  {actionLoading === r.id ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    "Accept"
                  )}
                </Button>
                <Button
                  size="small"
                  color="error"
                  disabled={actionLoading === r.id}
                  onClick={() => handleReject(r.id)}
                >
                  {actionLoading === r.id ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    "Reject"
                  )}
                </Button>
              </Box>
            </Box>
          </Paper>
        ))}
    </Stack>
  </Box>
)}
    <Chip label="Your ride" variant="outlined" sx={{ alignSelf: "flex-start" }} />
    {ride.requests.filter((r) => r.status === "ACCEPTED").length > 0 && (
      <Box sx={{ mt: 2, width: "100%" }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          Passengers
        </Typography>
        <Stack spacing={1}>
          {ride.requests
            .filter((r) => r.status === "ACCEPTED")
            .map((r) => (
              <Paper key={r.id} variant="outlined" sx={{ p: 1.5 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {r.user?.name || r.user?.email}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {r.seatsRequested} seat{r.seatsRequested > 1 ? "s" : ""}
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    onClick={() => setActiveThreadId(activeThreadId === r.id ? null : r.id)}
                  >
                    {activeThreadId === r.id ? "Hide" : "Message"}
                  </Button>
                </Box>
                {activeThreadId === r.id && (
                  <Box sx={{ mt: 1.5 }}>
                    <MessageThread
                      requestId={r.id}
                      otherPartyName={r.user?.name || r.user?.email || "Passenger"}
                    />
                  </Box>
                )}
              </Paper>
            ))}
        </Stack>
      </Box>
    )}
  </>
)}
{!isOwn && (() => {
  const ownRequest = ride.requests.find((r) => r.userId === user?.id);
  if (ownRequest?.status !== "ACCEPTED") return null;
  return (
    <Box sx={{ mt: 2, width: "100%" }}>
      <MessageThread
        requestId={ownRequest.id}
        otherPartyName={ride.driver.name || ride.driver.email}
      />
    </Box>
  );
})()}
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
  );
}