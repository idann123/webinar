import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = { title: "Masuk" };

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    redirect(`/dashboard/${session.role.toLowerCase()}`);
  }
  return <LoginForm />;
}