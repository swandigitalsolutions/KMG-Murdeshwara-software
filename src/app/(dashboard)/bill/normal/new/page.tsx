import { format } from "date-fns";
import { createBill } from "../../_shared/actions";
import BillForm from "../../_shared/BillForm";

export default function NewNormalBillPage() {
  const action = createBill.bind(null, "NORMAL");
  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-xl font-semibold text-slate-900">New Normal Bill</h1>
      <BillForm action={action} isEway={false} defaults={{ date: format(new Date(), "yyyy-MM-dd") }} submitLabel="Create Bill" />
    </div>
  );
}
