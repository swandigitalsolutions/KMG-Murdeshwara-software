import { findCompanyNameSafe } from "@/lib/companyLookup";
import LoginForm from "@/app/_shared-login/LoginForm";

export default async function KmgLoginPage() {
  const companyLabel = await findCompanyNameSafe("KMG", "KMG Stones");
  return <LoginForm companyCode="KMG" companyLabel={companyLabel} />;
}
