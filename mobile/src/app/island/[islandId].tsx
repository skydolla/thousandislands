import { useLocalSearchParams } from "expo-router";
import { IslandSheet } from "@/screens/island-sheet";

export default function IslandRoute() {
  const { islandId } = useLocalSearchParams<{ islandId: string }>();
  return <IslandSheet key={islandId} islandId={islandId} />;
}
