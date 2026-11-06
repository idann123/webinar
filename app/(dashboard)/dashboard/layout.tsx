import { requireSession } from "@/lib/session";
import { db } from "@/lib/db";
import { sinkronNotifikasiSiswa } from "@/lib/notifikasi";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import type { NotifikasiItem } from "@/components/dashboard/NotificationBell";

const waktuFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Jakarta",
});

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();

  let notifications: NotifikasiItem[] = [];
  let unreadCount = 0;

  if (session.role === "SISWA") {
    try {
      await sinkronNotifikasiSiswa(session.userId);
    } catch (error) {
      console.error("Gagal menyinkronkan notifikasi", error);
    }

    const [rows, unread] = await Promise.all([
      db.notifikasi.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      db.notifikasi.count({
        where: { userId: session.userId, dibaca: false },
      }),
    ]);

    notifications = rows.map((n) => ({
      id: n.id,
      tipe: n.tipe,
      judul: n.judul,
      pesan: n.pesan,
      href: n.href,
      dibaca: n.dibaca,
      waktu: `${waktuFormatter.format(n.createdAt)} WIB`,
    }));
    unreadCount = unread;
  }

  return (
    <DashboardShell
      user={{ nama: session.nama, role: session.role }}
      notifications={notifications}
      unreadCount={unreadCount}
    >
      {children}
    </DashboardShell>
  );
}
