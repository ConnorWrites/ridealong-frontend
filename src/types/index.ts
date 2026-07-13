export type UserRole = "DRIVER" | "PASSENGER" | "ADMIN";
export type RequestStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
}

export interface Ride {
  id: string;
  origin: string;
  destination: string;
  departureTime: string;
  availableSeats: number;
  bookedSeats: number;
  driverId: string;
  createdAt: string;
  driver: {
    id: string;
    name: string | null;
    email: string;
  };
  requests: RideRequest[];
}

export interface RideRequest {
  id: string;
  status: RequestStatus;
  seatsRequested: number;
  createdAt: string;
  userId: string;
  rideId: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}