import { useLocalSearchParams } from "expo-router";
import { IslandMerge } from "@/screens/island-merge";

export default function IslandMergeRoute() {
  const { keepId, keepName } = useLocalSearchParams<{ keepId: string; keepName: string }>();
  return <IslandMerge keepId={keepId} keepName={keepName} />;
}
