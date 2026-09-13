import BillView from "../../_shared/BillView";

export default async function EwayBillViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BillView id={id} billType="EWAY" basePath="/bill/eway" />;
}
