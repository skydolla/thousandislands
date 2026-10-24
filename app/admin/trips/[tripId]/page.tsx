import TripEditor from "@/components/admin/TripEditor";

export default async function EditTripPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  return <TripEditor key={tripId} tripId={tripId} />;
}
