import { Shell } from "@/components/Shell";
import { ResourceDetail } from "@/components/ResourceDetail";

export default function ResourceDetailPage({ params }: { params: { id: string } }) {
  return (
    <Shell>
      <ResourceDetail id={params.id} />
    </Shell>
  );
}
