export interface Trip {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Island {
  id: string;
  name: string;
  country: string;
  regionOrState: string | null;
  latitude: number;
  longitude: number;
  externalReferenceId: string | null;
  notes: string | null;
  createdAt: string;
}

export interface Attendee {
  id: string;
  name: string;
  createdAt: string;
}

export interface TripIsland {
  id: string;
  tripId: string;
  islandId: string;
  sequenceNumber: number | null;
  createdAt: string;
}

export interface TripAttendee {
  id: string;
  tripId: string;
  attendeeId: string;
  role: string | null;
  createdAt: string;
}

export interface Picture {
  id: string;
  tripId: string;
  tripIslandId: string;
  imageUrl: string;
  caption: string | null;
  takenAt: string | null;
  sortOrder: number | null;
  createdAt: string;
}

// --- API response shapes ---

export interface MapPin {
  tripId: string;
  tripName: string;
  islandId: string;
  islandName: string;
  country: string;
  regionOrState: string | null;
  latitude: number;
  longitude: number;
}

export interface MapPinsResponse {
  pins: MapPin[];
}

export interface TripDetailIslandPicture {
  id: string;
  imageUrl: string;
  caption: string | null;
  takenAt: string | null;
  sortOrder: number | null;
}

export interface TripDetailIsland {
  tripIslandId: string;
  sequenceNumber: number | null;
  island: {
    id: string;
    name: string;
    country: string;
    regionOrState: string | null;
    latitude: number;
    longitude: number;
  };
  pictures: TripDetailIslandPicture[];
}

export interface TripDetailAttendee {
  id: string;
  name: string;
}

export interface TripDetailResponse {
  trip: {
    id: string;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    islandCount: number;
    country: string | null;
    regionOrState: string | null;
    attendees: TripDetailAttendee[];
    islands: TripDetailIsland[];
  };
}

export interface ProgressResponse {
  uniqueIslandsVisited: number;
  goal: number;
}

export interface ApiError {
  error: {
    code: "BAD_REQUEST" | "NOT_FOUND" | "INTERNAL_ERROR";
    message: string;
  };
}
