import { format } from "date-fns";
import { createQuotation } from "../actions";
import QuotationForm from "../QuotationForm";

export default function NewQuotationPage() {
  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-xl font-semibold text-slate-900">New Quotation</h1>
      <QuotationForm
        action={createQuotation}
        defaultDate={format(new Date(), "yyyy-MM-dd")}
        submitLabel="Create Quotation"
      />
    </div>
  );
}
