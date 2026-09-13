import { format } from "date-fns";
import { createBill } from "../../_shared/actions";
import BillForm from "../../_shared/BillForm";

export default function NewEwayBillPage() {
  const action = createBill.bind(null, "EWAY");
  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-xl font-semibold text-slate-900">New E-Way Bill</h1>
      <BillForm action={action} isEway defaults={{ date: format(new Date(), "yyyy-MM-dd") }} submitLabel="Create E-Way Bill" />
    </div>
  );
}
