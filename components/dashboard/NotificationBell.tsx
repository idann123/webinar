"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Icon } from "@/components/Icon";
import { cn } from "@/lib/utils";
import {
  tandaiNotifikasiDibaca,
  tandaiSemuaNotifikasiDibaca,
} from "@/lib/actions/notifikasi";

export type NotifikasiItem = {
  id: number;
  tipe: string;
  judul: string;
  pesan: string;
  href: string;
  dibaca: boolean;
  waktu: string;
};

export function NotificationBell({
  items,
  unreadCount,
}: {
  items: NotifikasiItem[];
  unreadCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => router.refresh(), 60000);
    return () => clearInterval(timer);
  }, [router]);

  const markRead = (id: number) => {
    startTransition(async () => {
      await tandaiNotifikasiDibaca(id);
      router.refresh();
    });
  };

  const markAll = () => {
    startTransition(async () => {
      await tandaiSemuaNotifikasiDibaca();
      router.refresh();
    });
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Notifikasi"
        aria-expanded={open}
        className="relative rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100"
      >
        <Icon
          name={unreadCount > 0 ? "notifications_active" : "notifications"}
          className="text-2xl"
          filled={unreadCount > 0}
        />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl sm:w-96">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="font-display text-sm font-bold text-slate-900">Notifikasi</p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAll}
                disabled={pending}
                className="text-xs font-semibold text-brand-700 hover:underline disabled:opacity-60"
              >
                Tandai semua dibaca
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
                <Icon name="notifications_off" className="text-3xl text-slate-300" />
                <p className="text-sm text-slate-500">Belum ada notifikasi.</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {items.map((n) => (
                  <li key={n.id}>
                    <Link
                      href={n.href}
                      onClick={() => {
                        if (!n.dibaca) markRead(n.id);
                        setOpen(false);
                      }}
                      className={cn(
                        "flex gap-3 px-4 py-3 transition-colors hover:bg-slate-50",
                        !n.dibaca && "bg-brand-50/50"
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                          n.tipe === "AKAN_MULAI"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-brand-100 text-brand-700"
                        )}
                      >
                        <Icon
                          name={n.tipe === "AKAN_MULAI" ? "alarm" : "event_available"}
                          className="text-xl"
                          filled
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-start justify-between gap-2">
                          <span
                            className={cn(
                              "text-sm",
                              n.dibaca
                                ? "font-medium text-slate-700"
                                : "font-bold text-slate-900"
                            )}
                          >
                            {n.judul}
                          </span>
                          {!n.dibaca && (
                            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-600" />
                          )}
                        </span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">
                          {n.pesan}
                        </span>
                        <span className="mt-1 block text-[11px] text-slate-400">
                          {n.waktu}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
