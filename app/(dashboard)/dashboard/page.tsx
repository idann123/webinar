import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";

export default async function DashboardIndex() {
  const session = await requireSession();
  redirect(`/dashboard/${session.role.toLowerCase()}`);
}