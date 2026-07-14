import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import NavBar from "./components/NavBar";
import IdleWarningDialog from "./components/IdleWarningDialog";
import { useIdleTimeout } from "./hooks/useIdleTimeout";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import RidesPage from "./pages/RidesPage";
import RideDetailPage from "./pages/RideDetailPage";
import PostRidePage from "./pages/PostRidePage";
import DashboardPage from "./pages/DashboardPage";
import { useState, useCallback } from "react";

const WARNING_SECONDS = 60; // Show warning 1 minute before logout

function AppRoutes() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [warningOpen, setWarningOpen] = useState(false);

  const handleWarn = useCallback(() => {
    if (user) setWarningOpen(true);
  }, [user]);

  const handleLogout = useCallback(async () => {
    setWarningOpen(false);
    await logout();
    navigate("/login");
  }, [logout, navigate]);

  const { resetTimers } = useIdleTimeout({
    idleMinutes: 10,
    warningMinutes: 1,
    onWarn: handleWarn,
    onLogout: handleLogout,
  });

function handleStayLoggedIn() {
    setWarningOpen(false);
    resetTimers();
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {user && <NavBar />}
      <Box component="main">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/rides"
            element={
              <ProtectedRoute>
                <RidesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rides/:rideId"
            element={
              <ProtectedRoute>
                <RideDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/post-ride"
            element={
              <ProtectedRoute>
                <PostRidePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={<Navigate to={user ? "/rides" : "/login"} replace />}
          />
        </Routes>
      </Box>
      <IdleWarningDialog
        open={warningOpen}
        onStayLoggedIn={handleStayLoggedIn}
        onLogoutNow={handleLogout}
        secondsRemaining={WARNING_SECONDS}
      />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}