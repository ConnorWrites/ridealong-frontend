import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  Alert,
  Chip,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
} from "@mui/material";
import { listRides, listMyRides, acceptRequest, rejectRequest } from "../api/rides";
import { useAuth } from "../context/AuthContext";
import type { Ride, RideRequest } from "../types";

type RideWithRequests = Ride & { requests: RideRequest[] };

const statusColor: Record<string, "default" | "warning" | "success" | "error"> = {
  PENDING: "warning",
  ACCEPTED: "success",
  REJECTED: "error",
};

export default function DashboardPage() {
  const { user, isDriver } = useAuth();
  const [myRides, setMyRides] = useState<RideWithRequests[]>([]);
  const [allRides, setAllRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);

  async function fetchData() {
    setLoading(true);
    setError("");
    try {
      if (isDriver) {
        const rides = await listMyRides();
        setMyRides(rides as RideWithRequests[]);
      } else {
        const rides = await listRides();
        setAllRides(rides);
      }
    } catch {
      setError("Could not load dashboard data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [isDriver]);

  async function handleAccept(requestId: string) {
    setActionId(requestId);
    try {
      await acceptRequest(requestId);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || "Could not accept request");
    } finally {
      setActionId(null);
    }
  }

  async function handleReject(requestId: string) {
    setActionId(requestId);
    try {
      await rejectRequest(requestId);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || "Could not reject request");
    } finally {
      setActionId(null);
    }
  }

  const myRequests = allRides.flatMap((ride) =>
    ride.requests
      .filter((r) => r.userId === user?.id)
      .map((r) => ({ request: r, ride }))
  );

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {isDriver ? "Manage requests on your rides." : "Track your ride requests."}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : isDriver ? (
        myRides.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: "center", mt: 6 }}>
            You haven't posted any rides yet.
          </Typography>
        ) : (
          myRides.map((ride) => (
            <Paper key={ride.id} variant="outlined" sx={{ mb: 3, p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {ride.origin} → {ride.destination}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {new Date(ride.departureTime).toLocaleString()}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {ride.requests.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No requests yet.
                </Typography>
              ) : (
                <List disablePadding>
                  {ride.requests.map((req) => (
                    <ListItem
                      key={req.id}
                      disablePadding
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        py: 1,
                        gap: 2,
                        flexWrap: "wrap",
                      }}
                    >
                      <ListItemText
                        primary={`Passenger: ${req.userId.slice(0, 8)}...`}
                        secondary={`Requested ${new Date(req.createdAt).toLocaleString()}`}
                      />
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Chip
                          label={req.status}
                          color={statusColor[req.status]}
                          size="small"
                        />
                        {req.status === "PENDING" && (
                          <>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              disabled={actionId === req.id}
                              onClick={() => handleAccept(req.id)}
                            >
                              Accept
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              disabled={actionId === req.id}
                              onClick={() => handleReject(req.id)}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </Box>
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          ))
        )
      ) : (
        myRequests.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: "center", mt: 6 }}>
            You haven't requested any rides yet.
          </Typography>
        ) : (
          <List disablePadding>
            {myRequests.map(({ request, ride }) => (
              <Paper key={request.id} variant="outlined" sx={{ mb: 2, p: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 1 }}>
                  <Box>
                    <Typography sx={{ fontWeight: 600 }}>
                      {ride.origin} → {ride.destination}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(ride.departureTime).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Driver: {ride.driver.name || ride.driver.email}
                    </Typography>
                  </Box>
                  <Chip
                    label={request.status}
                    color={statusColor[request.status]}
                    size="small"
                  />
                </Box>
              </Paper>
            ))}
          </List>
        )
      )}
    </Container>
  );
}