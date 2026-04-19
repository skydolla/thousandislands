import type {
  Trip,
  Island,
  Attendee,
  TripIsland,
  TripAttendee,
  Picture,
} from "@/lib/types";

// --- Attendees ---

export const attendees: Attendee[] = [
  { id: "att-001", name: "Alex", createdAt: "2024-01-01T00:00:00Z" },
  { id: "att-002", name: "Sam", createdAt: "2024-01-01T00:00:00Z" },
  { id: "att-003", name: "Jordan", createdAt: "2024-01-01T00:00:00Z" },
  { id: "att-004", name: "Taylor", createdAt: "2024-01-01T00:00:00Z" },
  { id: "att-005", name: "Morgan", createdAt: "2024-01-01T00:00:00Z" },
];

// --- Islands ---

export const islands: Island[] = [
  {
    id: "isl-001",
    name: "Santorini",
    country: "Greece",
    regionOrState: "South Aegean",
    latitude: 36.3932,
    longitude: 25.4615,
    externalReferenceId: null,
    notes: null,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "isl-002",
    name: "Bequia",
    country: "Saint Vincent and the Grenadines",
    regionOrState: null,
    latitude: 13.0092,
    longitude: -61.2356,
    externalReferenceId: null,
    notes: null,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "isl-003",
    name: "Mustique",
    country: "Saint Vincent and the Grenadines",
    regionOrState: null,
    latitude: 12.8878,
    longitude: -61.1813,
    externalReferenceId: null,
    notes: null,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "isl-004",
    name: "Canouan",
    country: "Saint Vincent and the Grenadines",
    regionOrState: null,
    latitude: 12.7117,
    longitude: -61.3264,
    externalReferenceId: null,
    notes: null,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "isl-005",
    name: "Maui",
    country: "United States",
    regionOrState: "Hawaii",
    latitude: 20.7984,
    longitude: -156.3319,
    externalReferenceId: null,
    notes: null,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "isl-006",
    name: "Oahu",
    country: "United States",
    regionOrState: "Hawaii",
    latitude: 21.4389,
    longitude: -158.0001,
    externalReferenceId: null,
    notes: null,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "isl-007",
    name: "Big Island",
    country: "United States",
    regionOrState: "Hawaii",
    latitude: 19.5429,
    longitude: -155.6659,
    externalReferenceId: null,
    notes: null,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "isl-008",
    name: "Bali",
    country: "Indonesia",
    regionOrState: "Bali",
    latitude: -8.3405,
    longitude: 115.092,
    externalReferenceId: null,
    notes: null,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "isl-009",
    name: "Zanzibar",
    country: "Tanzania",
    regionOrState: null,
    latitude: -6.1659,
    longitude: 39.1989,
    externalReferenceId: null,
    notes: null,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "isl-010",
    name: "Capri",
    country: "Italy",
    regionOrState: "Campania",
    latitude: 40.5531,
    longitude: 14.2222,
    externalReferenceId: null,
    notes: null,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "isl-011",
    name: "Santa Cruz",
    country: "Ecuador",
    regionOrState: "Galápagos",
    latitude: -0.6238,
    longitude: -90.3684,
    externalReferenceId: null,
    notes: null,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "isl-012",
    name: "Isabela",
    country: "Ecuador",
    regionOrState: "Galápagos",
    latitude: -0.8675,
    longitude: -91.096,
    externalReferenceId: null,
    notes: null,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "isl-013",
    name: "Bermuda",
    country: "Bermuda",
    regionOrState: null,
    latitude: 32.3078,
    longitude: -64.7505,
    externalReferenceId: null,
    notes: null,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "isl-014",
    name: "Phi Phi Don",
    country: "Thailand",
    regionOrState: "Krabi",
    latitude: 7.7407,
    longitude: 98.7784,
    externalReferenceId: null,
    notes: null,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "isl-015",
    name: "Phi Phi Leh",
    country: "Thailand",
    regionOrState: "Krabi",
    latitude: 7.6809,
    longitude: 98.7648,
    externalReferenceId: null,
    notes: null,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "isl-016",
    name: "Malé",
    country: "Maldives",
    regionOrState: null,
    latitude: 4.1755,
    longitude: 73.5093,
    externalReferenceId: null,
    notes: null,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "isl-017",
    name: "Maafushi",
    country: "Maldives",
    regionOrState: null,
    latitude: 3.9408,
    longitude: 73.4871,
    externalReferenceId: null,
    notes: null,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "isl-018",
    name: "Mykonos",
    country: "Greece",
    regionOrState: "South Aegean",
    latitude: 37.4467,
    longitude: 25.3289,
    externalReferenceId: null,
    notes: null,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "isl-019",
    name: "Crete",
    country: "Greece",
    regionOrState: "Crete",
    latitude: 35.2401,
    longitude: 24.4709,
    externalReferenceId: null,
    notes: null,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "isl-020",
    name: "Barbados",
    country: "Barbados",
    regionOrState: null,
    latitude: 13.1939,
    longitude: -59.5432,
    externalReferenceId: null,
    notes: null,
    createdAt: "2024-01-01T00:00:00Z",
  },
];

// --- Trips ---

export const trips: Trip[] = [
  {
    id: "trip-001",
    name: "Santorini Getaway",
    description:
      "A week exploring the stunning caldera views, white-washed villages, and volcanic beaches of Santorini.",
    startDate: "2023-09-12",
    endDate: "2023-09-19",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "trip-002",
    name: "Grenadines Sailing Adventure",
    description:
      "A sailing trip through several islands in the Grenadines, hopping between pristine beaches and quiet harbors.",
    startDate: "2024-06-10",
    endDate: "2024-06-18",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "trip-003",
    name: "Hawaiian Island Hopping",
    description:
      "Two weeks across three Hawaiian islands — volcanoes, rainforests, and world-class surfing.",
    startDate: "2024-03-01",
    endDate: "2024-03-14",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "trip-004",
    name: "Bali Retreat",
    description:
      "A relaxing ten days in Bali with rice terraces, temple visits, and surfing in Uluwatu.",
    startDate: "2023-11-05",
    endDate: "2023-11-15",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "trip-005",
    name: "Zanzibar Escape",
    description:
      "Five days on Zanzibar exploring Stone Town, spice farms, and turquoise waters.",
    startDate: "2024-02-18",
    endDate: "2024-02-23",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "trip-006",
    name: "Capri Day Trip",
    description:
      "A quick boat ride from Naples to the glamorous island of Capri, including the Blue Grotto.",
    startDate: "2024-07-20",
    endDate: "2024-07-21",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "trip-007",
    name: "Galápagos Wildlife Expedition",
    description:
      "A guided expedition through the Galápagos Islands, observing giant tortoises, marine iguanas, and blue-footed boobies.",
    startDate: "2024-04-05",
    endDate: "2024-04-12",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "trip-008",
    name: "Bermuda Weekend",
    description:
      "A long weekend in Bermuda with pink sand beaches, crystal caves, and fish chowder.",
    startDate: "2024-08-15",
    endDate: "2024-08-18",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "trip-009",
    name: "Phi Phi Islands Tour",
    description:
      "Exploring Thailand's iconic Phi Phi Islands — Maya Bay, snorkeling, and limestone cliffs.",
    startDate: "2024-01-08",
    endDate: "2024-01-12",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "trip-010",
    name: "Maldives Overwater Escape",
    description:
      "A dreamy getaway in the Maldives with overwater bungalows, diving, and dolphin cruises.",
    startDate: "2024-12-20",
    endDate: "2024-12-28",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "trip-011",
    name: "Greek Island Cruise",
    description:
      "A short cruise hitting Mykonos and Crete, mixing nightlife with ancient ruins and hiking.",
    startDate: "2025-05-10",
    endDate: "2025-05-17",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "trip-012",
    name: "Barbados Sun & Surf",
    description:
      "A week in Barbados with rum distillery tours, cricket on the beach, and amazing seafood.",
    startDate: "2025-02-01",
    endDate: "2025-02-08",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
];

// --- Trip-Island relationships ---

export const tripIslands: TripIsland[] = [
  // Trip 1: Santorini (single island)
  { id: "ti-001", tripId: "trip-001", islandId: "isl-001", sequenceNumber: 1, createdAt: "2024-01-01T00:00:00Z" },
  // Trip 2: Grenadines (3 islands)
  { id: "ti-002", tripId: "trip-002", islandId: "isl-002", sequenceNumber: 1, createdAt: "2024-01-01T00:00:00Z" },
  { id: "ti-003", tripId: "trip-002", islandId: "isl-003", sequenceNumber: 2, createdAt: "2024-01-01T00:00:00Z" },
  { id: "ti-004", tripId: "trip-002", islandId: "isl-004", sequenceNumber: 3, createdAt: "2024-01-01T00:00:00Z" },
  // Trip 3: Hawaii (3 islands)
  { id: "ti-005", tripId: "trip-003", islandId: "isl-005", sequenceNumber: 1, createdAt: "2024-01-01T00:00:00Z" },
  { id: "ti-006", tripId: "trip-003", islandId: "isl-006", sequenceNumber: 2, createdAt: "2024-01-01T00:00:00Z" },
  { id: "ti-007", tripId: "trip-003", islandId: "isl-007", sequenceNumber: 3, createdAt: "2024-01-01T00:00:00Z" },
  // Trip 4: Bali (single island)
  { id: "ti-008", tripId: "trip-004", islandId: "isl-008", sequenceNumber: 1, createdAt: "2024-01-01T00:00:00Z" },
  // Trip 5: Zanzibar (single island)
  { id: "ti-009", tripId: "trip-005", islandId: "isl-009", sequenceNumber: 1, createdAt: "2024-01-01T00:00:00Z" },
  // Trip 6: Capri (single island)
  { id: "ti-010", tripId: "trip-006", islandId: "isl-010", sequenceNumber: 1, createdAt: "2024-01-01T00:00:00Z" },
  // Trip 7: Galápagos (2 islands)
  { id: "ti-011", tripId: "trip-007", islandId: "isl-011", sequenceNumber: 1, createdAt: "2024-01-01T00:00:00Z" },
  { id: "ti-012", tripId: "trip-007", islandId: "isl-012", sequenceNumber: 2, createdAt: "2024-01-01T00:00:00Z" },
  // Trip 8: Bermuda (single island)
  { id: "ti-013", tripId: "trip-008", islandId: "isl-013", sequenceNumber: 1, createdAt: "2024-01-01T00:00:00Z" },
  // Trip 9: Phi Phi (2 islands)
  { id: "ti-014", tripId: "trip-009", islandId: "isl-014", sequenceNumber: 1, createdAt: "2024-01-01T00:00:00Z" },
  { id: "ti-015", tripId: "trip-009", islandId: "isl-015", sequenceNumber: 2, createdAt: "2024-01-01T00:00:00Z" },
  // Trip 10: Maldives (2 islands)
  { id: "ti-016", tripId: "trip-010", islandId: "isl-016", sequenceNumber: 1, createdAt: "2024-01-01T00:00:00Z" },
  { id: "ti-017", tripId: "trip-010", islandId: "isl-017", sequenceNumber: 2, createdAt: "2024-01-01T00:00:00Z" },
  // Trip 11: Greek Island Cruise (2 islands)
  { id: "ti-018", tripId: "trip-011", islandId: "isl-018", sequenceNumber: 1, createdAt: "2024-01-01T00:00:00Z" },
  { id: "ti-019", tripId: "trip-011", islandId: "isl-019", sequenceNumber: 2, createdAt: "2024-01-01T00:00:00Z" },
  // Trip 12: Barbados (single island)
  { id: "ti-020", tripId: "trip-012", islandId: "isl-020", sequenceNumber: 1, createdAt: "2024-01-01T00:00:00Z" },
];

// --- Trip-Attendee relationships ---

export const tripAttendees: TripAttendee[] = [
  { id: "ta-001", tripId: "trip-001", attendeeId: "att-001", role: null, createdAt: "2024-01-01T00:00:00Z" },
  { id: "ta-002", tripId: "trip-001", attendeeId: "att-002", role: null, createdAt: "2024-01-01T00:00:00Z" },
  { id: "ta-003", tripId: "trip-002", attendeeId: "att-001", role: null, createdAt: "2024-01-01T00:00:00Z" },
  { id: "ta-004", tripId: "trip-002", attendeeId: "att-003", role: null, createdAt: "2024-01-01T00:00:00Z" },
  { id: "ta-005", tripId: "trip-003", attendeeId: "att-001", role: null, createdAt: "2024-01-01T00:00:00Z" },
  { id: "ta-006", tripId: "trip-003", attendeeId: "att-002", role: null, createdAt: "2024-01-01T00:00:00Z" },
  { id: "ta-007", tripId: "trip-003", attendeeId: "att-004", role: null, createdAt: "2024-01-01T00:00:00Z" },
  { id: "ta-008", tripId: "trip-004", attendeeId: "att-001", role: null, createdAt: "2024-01-01T00:00:00Z" },
  { id: "ta-009", tripId: "trip-004", attendeeId: "att-005", role: null, createdAt: "2024-01-01T00:00:00Z" },
  { id: "ta-010", tripId: "trip-005", attendeeId: "att-001", role: null, createdAt: "2024-01-01T00:00:00Z" },
  { id: "ta-011", tripId: "trip-005", attendeeId: "att-003", role: null, createdAt: "2024-01-01T00:00:00Z" },
  { id: "ta-012", tripId: "trip-006", attendeeId: "att-001", role: null, createdAt: "2024-01-01T00:00:00Z" },
  { id: "ta-013", tripId: "trip-006", attendeeId: "att-002", role: null, createdAt: "2024-01-01T00:00:00Z" },
  { id: "ta-014", tripId: "trip-007", attendeeId: "att-001", role: null, createdAt: "2024-01-01T00:00:00Z" },
  { id: "ta-015", tripId: "trip-007", attendeeId: "att-004", role: null, createdAt: "2024-01-01T00:00:00Z" },
  { id: "ta-016", tripId: "trip-008", attendeeId: "att-001", role: null, createdAt: "2024-01-01T00:00:00Z" },
  { id: "ta-017", tripId: "trip-009", attendeeId: "att-001", role: null, createdAt: "2024-01-01T00:00:00Z" },
  { id: "ta-018", tripId: "trip-009", attendeeId: "att-005", role: null, createdAt: "2024-01-01T00:00:00Z" },
  { id: "ta-019", tripId: "trip-010", attendeeId: "att-001", role: null, createdAt: "2024-01-01T00:00:00Z" },
  { id: "ta-020", tripId: "trip-010", attendeeId: "att-002", role: null, createdAt: "2024-01-01T00:00:00Z" },
  { id: "ta-021", tripId: "trip-011", attendeeId: "att-001", role: null, createdAt: "2024-01-01T00:00:00Z" },
  { id: "ta-022", tripId: "trip-011", attendeeId: "att-003", role: null, createdAt: "2024-01-01T00:00:00Z" },
  { id: "ta-023", tripId: "trip-012", attendeeId: "att-001", role: null, createdAt: "2024-01-01T00:00:00Z" },
  { id: "ta-024", tripId: "trip-012", attendeeId: "att-004", role: null, createdAt: "2024-01-01T00:00:00Z" },
];

// --- Pictures ---
// Using picsum.photos for demo images (free, no API key, deterministic by seed)

export const pictures: Picture[] = [
  // Santorini (ti-001)
  { id: "pic-001", tripId: "trip-001", tripIslandId: "ti-001", imageUrl: "https://picsum.photos/seed/santorini1/800/600", caption: "Oia sunset over the caldera", takenAt: "2023-09-13T18:30:00Z", sortOrder: 1, createdAt: "2024-01-01T00:00:00Z" },
  { id: "pic-002", tripId: "trip-001", tripIslandId: "ti-001", imageUrl: "https://picsum.photos/seed/santorini2/800/600", caption: "Blue-domed churches of Fira", takenAt: "2023-09-14T10:00:00Z", sortOrder: 2, createdAt: "2024-01-01T00:00:00Z" },
  { id: "pic-003", tripId: "trip-001", tripIslandId: "ti-001", imageUrl: "https://picsum.photos/seed/santorini3/800/600", caption: "Red Beach volcanic cliffs", takenAt: "2023-09-15T14:00:00Z", sortOrder: 3, createdAt: "2024-01-01T00:00:00Z" },

  // Bequia (ti-002)
  { id: "pic-004", tripId: "trip-002", tripIslandId: "ti-002", imageUrl: "https://picsum.photos/seed/bequia1/800/600", caption: "Arriving at Port Elizabeth harbor", takenAt: "2024-06-10T11:00:00Z", sortOrder: 1, createdAt: "2024-01-01T00:00:00Z" },
  { id: "pic-005", tripId: "trip-002", tripIslandId: "ti-002", imageUrl: "https://picsum.photos/seed/bequia2/800/600", caption: "Princess Margaret Beach", takenAt: "2024-06-11T15:00:00Z", sortOrder: 2, createdAt: "2024-01-01T00:00:00Z" },

  // Mustique (ti-003)
  { id: "pic-006", tripId: "trip-002", tripIslandId: "ti-003", imageUrl: "https://picsum.photos/seed/mustique1/800/600", caption: "Macaroni Beach", takenAt: "2024-06-13T12:00:00Z", sortOrder: 1, createdAt: "2024-01-01T00:00:00Z" },

  // Canouan (ti-004)
  { id: "pic-007", tripId: "trip-002", tripIslandId: "ti-004", imageUrl: "https://picsum.photos/seed/canouan1/800/600", caption: "Canouan reef from the hilltop", takenAt: "2024-06-15T09:00:00Z", sortOrder: 1, createdAt: "2024-01-01T00:00:00Z" },

  // Maui (ti-005)
  { id: "pic-008", tripId: "trip-003", tripIslandId: "ti-005", imageUrl: "https://picsum.photos/seed/maui1/800/600", caption: "Road to Hana", takenAt: "2024-03-02T10:00:00Z", sortOrder: 1, createdAt: "2024-01-01T00:00:00Z" },
  { id: "pic-009", tripId: "trip-003", tripIslandId: "ti-005", imageUrl: "https://picsum.photos/seed/maui2/800/600", caption: "Haleakalā sunrise", takenAt: "2024-03-03T06:00:00Z", sortOrder: 2, createdAt: "2024-01-01T00:00:00Z" },

  // Oahu (ti-006)
  { id: "pic-010", tripId: "trip-003", tripIslandId: "ti-006", imageUrl: "https://picsum.photos/seed/oahu1/800/600", caption: "Waikiki Beach at dusk", takenAt: "2024-03-06T18:00:00Z", sortOrder: 1, createdAt: "2024-01-01T00:00:00Z" },
  { id: "pic-011", tripId: "trip-003", tripIslandId: "ti-006", imageUrl: "https://picsum.photos/seed/oahu2/800/600", caption: "North Shore waves", takenAt: "2024-03-07T14:00:00Z", sortOrder: 2, createdAt: "2024-01-01T00:00:00Z" },

  // Big Island (ti-007)
  { id: "pic-012", tripId: "trip-003", tripIslandId: "ti-007", imageUrl: "https://picsum.photos/seed/bigisland1/800/600", caption: "Kīlauea lava fields", takenAt: "2024-03-10T16:00:00Z", sortOrder: 1, createdAt: "2024-01-01T00:00:00Z" },

  // Bali (ti-008)
  { id: "pic-013", tripId: "trip-004", tripIslandId: "ti-008", imageUrl: "https://picsum.photos/seed/bali1/800/600", caption: "Tegallalang rice terraces", takenAt: "2023-11-07T09:00:00Z", sortOrder: 1, createdAt: "2024-01-01T00:00:00Z" },
  { id: "pic-014", tripId: "trip-004", tripIslandId: "ti-008", imageUrl: "https://picsum.photos/seed/bali2/800/600", caption: "Uluwatu temple at sunset", takenAt: "2023-11-09T17:30:00Z", sortOrder: 2, createdAt: "2024-01-01T00:00:00Z" },
  { id: "pic-015", tripId: "trip-004", tripIslandId: "ti-008", imageUrl: "https://picsum.photos/seed/bali3/800/600", caption: "Surfing in Canggu", takenAt: "2023-11-11T08:00:00Z", sortOrder: 3, createdAt: "2024-01-01T00:00:00Z" },

  // Zanzibar (ti-009)
  { id: "pic-016", tripId: "trip-005", tripIslandId: "ti-009", imageUrl: "https://picsum.photos/seed/zanzibar1/800/600", caption: "Stone Town alleyways", takenAt: "2024-02-19T10:00:00Z", sortOrder: 1, createdAt: "2024-01-01T00:00:00Z" },
  { id: "pic-017", tripId: "trip-005", tripIslandId: "ti-009", imageUrl: "https://picsum.photos/seed/zanzibar2/800/600", caption: "Nungwi Beach", takenAt: "2024-02-20T15:00:00Z", sortOrder: 2, createdAt: "2024-01-01T00:00:00Z" },

  // Capri (ti-010)
  { id: "pic-018", tripId: "trip-006", tripIslandId: "ti-010", imageUrl: "https://picsum.photos/seed/capri1/800/600", caption: "Faraglioni rocks from the sea", takenAt: "2024-07-20T12:00:00Z", sortOrder: 1, createdAt: "2024-01-01T00:00:00Z" },
  { id: "pic-019", tripId: "trip-006", tripIslandId: "ti-010", imageUrl: "https://picsum.photos/seed/capri2/800/600", caption: "View from Monte Solaro", takenAt: "2024-07-20T15:00:00Z", sortOrder: 2, createdAt: "2024-01-01T00:00:00Z" },

  // Santa Cruz (ti-011)
  { id: "pic-020", tripId: "trip-007", tripIslandId: "ti-011", imageUrl: "https://picsum.photos/seed/galapagos1/800/600", caption: "Giant tortoise at Charles Darwin Station", takenAt: "2024-04-06T10:00:00Z", sortOrder: 1, createdAt: "2024-01-01T00:00:00Z" },
  { id: "pic-021", tripId: "trip-007", tripIslandId: "ti-011", imageUrl: "https://picsum.photos/seed/galapagos2/800/600", caption: "Tortuga Bay beach", takenAt: "2024-04-07T14:00:00Z", sortOrder: 2, createdAt: "2024-01-01T00:00:00Z" },

  // Isabela (ti-012)
  { id: "pic-022", tripId: "trip-007", tripIslandId: "ti-012", imageUrl: "https://picsum.photos/seed/isabela1/800/600", caption: "Marine iguanas on the lava rocks", takenAt: "2024-04-09T11:00:00Z", sortOrder: 1, createdAt: "2024-01-01T00:00:00Z" },

  // Bermuda (ti-013)
  { id: "pic-023", tripId: "trip-008", tripIslandId: "ti-013", imageUrl: "https://picsum.photos/seed/bermuda1/800/600", caption: "Horseshoe Bay pink sand", takenAt: "2024-08-16T13:00:00Z", sortOrder: 1, createdAt: "2024-01-01T00:00:00Z" },
  { id: "pic-024", tripId: "trip-008", tripIslandId: "ti-013", imageUrl: "https://picsum.photos/seed/bermuda2/800/600", caption: "Crystal Cave formations", takenAt: "2024-08-17T10:00:00Z", sortOrder: 2, createdAt: "2024-01-01T00:00:00Z" },

  // Phi Phi Don (ti-014)
  { id: "pic-025", tripId: "trip-009", tripIslandId: "ti-014", imageUrl: "https://picsum.photos/seed/phiphi1/800/600", caption: "Viewpoint overlooking Tonsai Bay", takenAt: "2024-01-09T08:00:00Z", sortOrder: 1, createdAt: "2024-01-01T00:00:00Z" },
  { id: "pic-026", tripId: "trip-009", tripIslandId: "ti-014", imageUrl: "https://picsum.photos/seed/phiphi2/800/600", caption: "Long Beach snorkeling", takenAt: "2024-01-09T15:00:00Z", sortOrder: 2, createdAt: "2024-01-01T00:00:00Z" },

  // Phi Phi Leh (ti-015)
  { id: "pic-027", tripId: "trip-009", tripIslandId: "ti-015", imageUrl: "https://picsum.photos/seed/phiphileh1/800/600", caption: "Maya Bay — the famous beach", takenAt: "2024-01-10T11:00:00Z", sortOrder: 1, createdAt: "2024-01-01T00:00:00Z" },

  // Malé (ti-016)
  { id: "pic-028", tripId: "trip-010", tripIslandId: "ti-016", imageUrl: "https://picsum.photos/seed/male1/800/600", caption: "Aerial view arriving by seaplane", takenAt: "2024-12-20T14:00:00Z", sortOrder: 1, createdAt: "2024-01-01T00:00:00Z" },

  // Maafushi (ti-017)
  { id: "pic-029", tripId: "trip-010", tripIslandId: "ti-017", imageUrl: "https://picsum.photos/seed/maafushi1/800/600", caption: "Overwater bungalow at sunset", takenAt: "2024-12-22T18:00:00Z", sortOrder: 1, createdAt: "2024-01-01T00:00:00Z" },
  { id: "pic-030", tripId: "trip-010", tripIslandId: "ti-017", imageUrl: "https://picsum.photos/seed/maafushi2/800/600", caption: "Diving with manta rays", takenAt: "2024-12-23T09:00:00Z", sortOrder: 2, createdAt: "2024-01-01T00:00:00Z" },

  // Mykonos (ti-018)
  { id: "pic-031", tripId: "trip-011", tripIslandId: "ti-018", imageUrl: "https://picsum.photos/seed/mykonos1/800/600", caption: "Little Venice waterfront", takenAt: "2025-05-11T19:00:00Z", sortOrder: 1, createdAt: "2025-01-01T00:00:00Z" },
  { id: "pic-032", tripId: "trip-011", tripIslandId: "ti-018", imageUrl: "https://picsum.photos/seed/mykonos2/800/600", caption: "Windmills at sunset", takenAt: "2025-05-12T18:30:00Z", sortOrder: 2, createdAt: "2025-01-01T00:00:00Z" },

  // Crete (ti-019)
  { id: "pic-033", tripId: "trip-011", tripIslandId: "ti-019", imageUrl: "https://picsum.photos/seed/crete1/800/600", caption: "Samariá Gorge hike", takenAt: "2025-05-14T08:00:00Z", sortOrder: 1, createdAt: "2025-01-01T00:00:00Z" },
  { id: "pic-034", tripId: "trip-011", tripIslandId: "ti-019", imageUrl: "https://picsum.photos/seed/crete2/800/600", caption: "Elafonissi pink sand beach", takenAt: "2025-05-15T14:00:00Z", sortOrder: 2, createdAt: "2025-01-01T00:00:00Z" },

  // Barbados (ti-020)
  { id: "pic-035", tripId: "trip-012", tripIslandId: "ti-020", imageUrl: "https://picsum.photos/seed/barbados1/800/600", caption: "Crane Beach waves", takenAt: "2025-02-02T11:00:00Z", sortOrder: 1, createdAt: "2025-01-01T00:00:00Z" },
  { id: "pic-036", tripId: "trip-012", tripIslandId: "ti-020", imageUrl: "https://picsum.photos/seed/barbados2/800/600", caption: "Mount Gay rum distillery tour", takenAt: "2025-02-04T14:00:00Z", sortOrder: 2, createdAt: "2025-01-01T00:00:00Z" },
];
