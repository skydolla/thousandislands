import IslandEditor from "@/components/admin/IslandEditor";

export default async function EditIslandPage({ params }: { params: Promise<{ islandId: string }> }) {
  const { islandId } = await params;
  return <IslandEditor key={islandId} islandId={islandId} />;
}
