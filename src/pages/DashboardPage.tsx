import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { TextField } from "@mui/material";
import { listRides, listMyRides, acceptRequest, rejectRequest, cancelRequest, deleteRide, updateRide } from "../api/rides";
import { useAuth } from "../context/AuthContext";
import styles from "./DashboardPage.module.css";
import type { Ride, RideRequest } from "../types";
import AppSnackbar from "../components/AppSnackbar";
import type { AlertColor } from "@mui/material";

type RideWithRequests = Ride & { requests: RideRequest[] };

const statusColor: Record<string, "default" | "warning" | "success" | "error"> = {
  PENDING: "warning",
  ACCEPTED: "success",
  REJECTED: "error",
  CANCELLED: "default",
};

export default function DashboardPage() {
  const { user, isDriver } = useAuth();
  const [myRides, setMyRides] = useState<RideWithRequests[]>([]);
  const [allRides, setAllRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as AlertColor,
  });

 // Edit dialog state
  const [editRide, setEditRide] = useState<RideWithRequests | null>(null);
  const [editOrigin, setEditOrigin] = useState("");
  const [editDestination, setEditDestination] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete confirm dialog
  const [deleteRideId, setDeleteRideId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
      await fetchData();
      showSnackbar("Ride request accepted!")
    } catch (err: any) {
      const message = err.response?.data?.error || "Could not accept the ride request.";
      setError(message);
      showSnackbar(message, "error");
    } finally {
      setActionId(null);
    }
  }

  async function handleReject(requestId: string) {
    setActionId(requestId);
    try {
      await rejectRequest(requestId);
      await fetchData();
      showSnackbar("Ride request rejected.");
    } catch (err: any) {
      const message = err.response?.data?.error || "Could not reject the ride request";
      setError(message);
      showSnackbar(message, "error");
    } finally {
      setActionId(null);
    }
  }

  async function handleCancel(requestId: string) {
    setActionId(requestId);
    try {
      await cancelRequest(requestId);
      await fetchData();
      showSnackbar("Booking cancelled successfully.");
    } catch (err: any) {
      const message = err.response?.data?.error || "Could not cancel the booking.";
      setError(message);
      showSnackbar(message, "error");
    } finally {
      setActionId(null);
    }
  }

async function handleDelete() {
    if (!deleteRideId) return;
    setDeleteLoading(true);
    try {
      await deleteRide(deleteRideId);
      setDeleteRideId(null);
      await fetchData();
      showSnackbar("Ride deleted successfully.");
    } catch (err: any) {
      const message = err.response?.data?.error || "Could not delete the ride.";
      setError(message);
      showSnackbar(message, "error");
    } finally {
      setDeleteLoading(false);
    }
  }

  function openEdit(ride: RideWithRequests) {
    setEditRide(ride);
    setEditOrigin(ride.origin);
    setEditDestination(ride.destination);
    setEditTime(new Date(ride.departureTime).toISOString().slice(0, 16));
    setEditError("");
  }

  async function handleEdit() {
    if (!editRide) return;
    setEditLoading(true);
    setEditError("");
    try {
      await updateRide(editRide.id, {
        origin: editOrigin,
        destination: editDestination,
        departureTime: editTime,
      });
      setEditRide(null);
      showSnackbar("Ride updated successfully.");
      await fetchData();
    } catch (err: any) {
      const message = err.response?.data?.error || "Could not update the ride.";
      setError(message);
      showSnackbar(message, "error");
    } finally {
      setEditLoading(false);
    }
  }

  function showSnackbar(message: string, severity: AlertColor = "success") {
    setSnackbar({
      open: true,
      message, 
      severity,
    });
  }

  const myRequests = allRides.flatMap((ride) =>
    ride.requests
      .filter((r) => r.userId === user?.id)
      .map((r) => ({ request: r, ride }))
  );

const minDateTime = new Date(Date.now() + 5 * 60 * 1000)
    .toISOString()
    .slice(0, 16);

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

        {error && (
          <Alert severity="error" className={styles.errorAlert}>
            {error}
          </Alert>
        )}

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
              <Paper key={ride.id} variant="outlined" className={styles.paperSection} sx={{ cursor: "pointer" }} onClick={() => navigate(`/rides/${ride.id}`)}>
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
                          primary={`Passenger: ${req.user?.name || req.user?.email || "Unknown passenger"}`}
                          secondary={`Requested ${req.seatsRequested} seat${req.seatsRequested > 1 ? "s" : ""} on ${new Date(req.createdAt).toLocaleString()} ${req.hasLuggage ? "with some luggage." : "without luggage."}`}
                          />
                          <ListItemText className={styles.itemLeft}
                          primary= {req.notes && (
                            <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1}}
                            ><strong>Notes:</strong> {req.notes}
                            </Typography>
                          )}
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
                                onClick={(e) => {
                           e.stopPropagation();
                           handleAccept(req.id);
                          }}
                              >
                                Accept
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                disabled={actionId === req.id}
                                onClick={(e) => {
                           e.stopPropagation();
                           handleReject(req.id);
                          }}
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

                {/* Driver actions */}
                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}>
                  <Button size="small" variant="outlined" onClick={(e) => {
                           e.stopPropagation();
                           openEdit(ride);
                          }}>
                    Edit
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={(e) => {
                           e.stopPropagation();
                          setDeleteRideId(ride.id);
                          }}
                  >
                    Delete
                  </Button>
                </Box>
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
                <Paper
                  key={request.id}
                  variant="outlined"
                  className={styles.paperSectionSmall}
                  sx={{ cursor: "pointer" }}
                  onClick={() => navigate(`/rides/${ride.id}`)}
                >
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

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Chip
                        label={request.status}
                        color={statusColor[request.status]}
                        size="small"
                      />
                      {(request.status === "PENDING" || request.status === "ACCEPTED") && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          disabled={actionId === request.id}
                          onClick={(e) => {
                           e.stopPropagation();
                           handleCancel(request.id);
                          }}
                        >
                          Cancel Booking
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Paper>
              ))}
            </List>
          )
        )}

        {/* Edit Ride Dialog */}
        <Dialog
          open={!!editRide}
          onClose={() => setEditRide(null)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Edit Ride</DialogTitle>

          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
            {editError && (
              <Alert severity="error">
                {editError}
              </Alert>
            )}

            <TextField
              label="From"
              value={editOrigin}
              onChange={(e) => setEditOrigin(e.target.value)}
              fullWidth
            />

            <TextField
              label="To"
              value={editDestination}
              onChange={(e) => setEditDestination(e.target.value)}
              fullWidth
            />

            <TextField
                label="Departure time"
                type="datetime-local"
                value={editTime}
                onChange={(e) => setEditTime(e.target.value)}
                fullWidth
                slotProps={{
                inputLabel: { shrink: true },
                              input: {
                              inputProps: { min: minDateTime },
                              },
                            }}
            />
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setEditRide(null)}>Cancel</Button>
            <Button variant="contained" disabled={editLoading} onClick={handleEdit}>
              {editLoading ? "Saving..." : "Save changes"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirm Dialog */}
        <Dialog
          open={!!deleteRideId}
          onClose={() => setDeleteRideId(null)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Delete ride?</DialogTitle>

          <DialogContent>
            <Typography>
              This will permanently delete the ride and all associated requests. This cannot be undone.
            </Typography>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setDeleteRideId(null)}>Keep ride</Button>
            <Button
              variant="contained"
              color="error"
              disabled={deleteLoading}
              onClick={handleDelete}
            >
              {deleteLoading ? "Deleting..." : "Delete ride"}
            </Button>
          </DialogActions>
        </Dialog>
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