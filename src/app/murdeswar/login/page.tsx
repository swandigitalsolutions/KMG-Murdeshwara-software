import { findCompanyNameSafe } from "@/lib/companyLookup";
import LoginForm from "@/app/_shared-login/LoginForm";

export default async function MurdeswarLoginPage() {
  const companyLabel = await findCompanyNameSafe("MURDESWAR", "Murdeshwara Stones");
  return <LoginForm companyCode="MURDESWAR" companyLabel={companyLabel} />;
}
