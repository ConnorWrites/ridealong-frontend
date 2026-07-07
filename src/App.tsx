import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import NavBar from "./components/NavBar";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import RidesPage from "./pages/RidesPage";
import RideDetailPage from "./pages/RideDetailPage";
import PostRidePage from "./pages/PostRidePage";
import DashboardPage from "./pages/DashboardPage";

function AppRoutes() {
  const { user, loading } = useAuth();

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