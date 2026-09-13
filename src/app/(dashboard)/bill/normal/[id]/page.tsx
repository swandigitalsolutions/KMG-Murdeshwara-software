import BillView from "../../_shared/BillView";

export default async function NormalBillViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BillView id={id} billType="NORMAL" basePath="/bill/normal" />;
}
