import api from "./client";
import type { AuthResponse, Ride, RideRequest } from "../types";

// Auth
export async function signup(
  email: string,
  password: string,
  name: string,
  role: "DRIVER" | "PASSENGER"
): Promise<AuthResponse> {
  const res = await api.post("/auth/signup", { email, password, name, role });
  return res.data;
}

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
}

// Rides
export async function listRides(filters?: {
  origin?: string;
  destination?: string;
}): Promise<Ride[]> {
  const res = await api.get("/rides", { params: filters });
  return res.data;
}

export async function getRide(rideId: string): Promise<Ride> {
  const res = await api.get(`/rides/${rideId}`);
  return res.data;
}

export async function listMyRides(): Promise<Ride[]> {
  const res = await api.get("/rides/mine");
  return res.data;
}

export async function createRide(data: {
  origin: string;
  destination: string;
  departureTime: string;
}): Promise<Ride> {
  const res = await api.post("/rides", data);
  return res.data;
}

// Ride Requests
export async function requestRide(rideId: string): Promise<RideRequest> {
  const res = await api.post(`/rides/${rideId}/request`);
  return res.data;
}

export async function acceptRequest(requestId: string) {
  const res = await api.post(`/rides/requests/${requestId}/accept`);
  return res.data;
}

export async function rejectRequest(requestId: string) {
  const res = await api.post(`/rides/requests/${requestId}/reject`);
  return res.data;
}