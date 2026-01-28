export type ReservationStatus = "active" | "modifiée" | "annulée" | "passée";

export interface Room {
  id: string;
  name: string;
  description: string;
  availability: string;
  isActive: boolean;
}

export interface Booking{
    id: string;
    roomId: string;
    userId: string;
    movieTitle: string;
    date: Date;
    status: ReservationStatus;
}