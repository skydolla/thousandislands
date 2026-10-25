import { useLocalSearchParams } from "expo-router";
import { NewIslandScreen } from "@/screens/new-island";

export default function NewIslandRoute() {
  const { name } = useLocalSearchParams<{ name?: string }>();
  return <NewIslandScreen initialName={name ?? ""} />;
}
