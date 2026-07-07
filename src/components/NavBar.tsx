import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Chip,
} from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NavBar() {
  const { user, logout, isDriver } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <AppBar position="static" elevation={1}>
      <Toolbar>
        <DirectionsCarIcon sx={{ mr: 1 }} />
        <Typography
          variant="h6"
          component={Link}
          to="/rides"
          sx={{ flexGrow: 1, textDecoration: "none", color: "inherit", fontWeight: 700 }}
        >
          RideAlong
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button color="inherit" component={Link} to="/rides">Browse Rides</Button>
          <Button color="inherit" component={Link} to="/dashboard">Dashboard</Button>
          {isDriver && (
            <Button color="inherit" component={Link} to="/post-ride">Post a Ride</Button>
          )}
          <Chip
            label={user?.role}
            size="small"
            sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", ml: 1 }}
          />
          <Button color="inherit" onClick={handleLogout}>Log out</Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}