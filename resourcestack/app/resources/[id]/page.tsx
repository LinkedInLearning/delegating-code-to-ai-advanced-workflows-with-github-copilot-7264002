import { Shell } from "@/components/Shell";
import { ResourceDetail } from "@/components/ResourceDetail";

export default async function ResourceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Shell>
      <ResourceDetail id={id} />
    </Shell>
  );
}
