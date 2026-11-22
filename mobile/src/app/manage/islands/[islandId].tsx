import { useLocalSearchParams } from "expo-router";
import { IslandDetail } from "@/screens/island-detail";

/** /manage/islands/<id>, with ?fromTrip=1 when opened from the trip editor. */
export default function IslandRoute() {
  const { islandId, fromTrip } = useLocalSearchParams<{ islandId: string; fromTrip?: string }>();
  return <IslandDetail key={islandId} islandId={islandId} fromTrip={fromTrip === "1"} />;
}
