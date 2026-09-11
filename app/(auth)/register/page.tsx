import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata = { title: "Daftar" };

export default async function RegisterPage() {
  const session = await getSession();
  if (session) {
    redirect(`/dashboard/${session.role.toLowerCase()}`);
  }

  const kelas = await db.kelas.findMany({
    orderBy: [{ jurusan: { namaJurusan: "asc" } }, { namaKelas: "asc" }],
    include: { jurusan: true },
  });

  return (
    <RegisterForm
      kelas={kelas.map((k) => ({
        id: k.id,
        namaKelas: k.namaKelas,
        namaJurusan: k.jurusan.namaJurusan,
      }))}
    />
  );
}