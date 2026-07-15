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

export async function me(): Promise<{ user: import("../types").User }> {
  const res = await api.get("/auth/me");
  return res.data;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
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
  availableSeats: number;
}): Promise<Ride> {
  const res = await api.post("/rides", data);
  return res.data;
}

export async function updateRide(
  rideId: string,
  data: { origin?: string; destination?: string; departureTime?: string; availableSeats?: number }
): Promise<Ride> {
  const res = await api.patch(`/rides/${rideId}`, data);
  return res.data;
}

export async function deleteRide(rideId: string): Promise<void> {
  await api.delete(`/rides/${rideId}`);
}

// Ride Requests
export async function requestRide(rideId: string, seatsRequested: number): Promise<RideRequest> {
  const res = await api.post(`/rides/${rideId}/request`, { seatsRequested });
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

export async function cancelRequest(requestId: string): Promise<void> {
  await api.delete(`/rides/requests/${requestId}`);
}