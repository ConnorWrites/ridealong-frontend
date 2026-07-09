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
import styles from "./DashboardPage.module.css";
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
  <div className={styles.hero}>
    <div className={styles.overlay} />
    <div className={styles.content}>
    <Container maxWidth="md" className={styles.container}>
      <Typography variant="h4" className={styles.title}>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" className={styles.subtitle}>
        {isDriver ? "Manage requests on your rides." : "Track your ride requests."}
      </Typography>

      {error && <Alert severity="error" className={styles.errorAlert}>{error}</Alert>}
      {loading ? (
        <Box className={styles.loadingWrap}>
          <CircularProgress />
        </Box>
      ) : isDriver ? (
        myRides.length === 0 ? (
          <Typography color="text.secondary" className={styles.emptyMessage}>
            You haven't posted any rides yet.
          </Typography>
        ) : (
          myRides.map((ride) => (
            <Paper key={ride.id} variant="outlined" className={styles.paperSection}>
              <Typography variant="h6" className={styles.rideTitle}>
                {ride.origin} → {ride.destination}
              </Typography>
              <Typography variant="body2" color="text.secondary" className={styles.rideTime}>
                {new Date(ride.departureTime).toLocaleString()}
              </Typography>
              <Divider className={styles.divider} />
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
                      className={styles.listItemRow}
                    >
                      <ListItemText
                      className={styles.itemLeft}
                        primary={`Passenger: ${req.userId.slice(0, 8)}...`}
                        secondary={`Requested ${new Date(req.createdAt).toLocaleString()}`}
                      />
                      <Box className={styles.itemActions}>
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
          <Typography color="text.secondary" className={styles.emptyMessage}>
            You haven't requested any rides yet.
          </Typography>
        ) : (
          <List disablePadding>
            {myRequests.map(({ request, ride }) => (
              <Paper key={request.id} variant="outlined" className={styles.paperSectionSmall}>
                <Box className={styles.requestCardTopRow}>
                  <Box>
                    <Typography className={styles.rideTitle}>
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
    </div>
  </div>
  );
}