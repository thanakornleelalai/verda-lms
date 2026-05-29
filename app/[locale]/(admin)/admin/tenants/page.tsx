import { TenantManager } from "./TenantManager";
import { getTenants } from "@/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminTenantsPage() {
  const tenants = await getTenants();
  return <TenantManager initial={tenants} />;
}
