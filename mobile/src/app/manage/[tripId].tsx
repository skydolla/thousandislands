import { useLocalSearchParams } from "expo-router";
import { TripEditorScreen } from "@/screens/trip-editor";

/** /manage/new creates a trip; /manage/<id> edits one. */
export default function TripRoute() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  return <TripEditorScreen key={tripId} tripId={tripId === "new" ? undefined : tripId} />;
}
