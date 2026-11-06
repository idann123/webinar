"use client";

import { useEffect } from "react";
import "animate.css";

/**
 * Menginisialisasi WOW.js sekali saat halaman dimuat.
 * Elemen yang diberi class "wow" + "animate__<nama animasi>" akan beranimasi
 * saat masuk viewport. Opsi per elemen lewat atribut data-wow-delay / data-wow-duration.
 */
export function WowInit() {
  useEffect(() => {
    // Hormati preferensi "kurangi gerakan": biarkan semua elemen tampil biasa
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;

    (async () => {
      const { default: WOW } = await import("wow.js");
      if (cancelled) return;

      new WOW({
        boxClass: "wow",
        animateClass: "animate__animated", // untuk animate.css v4
        offset: 80, // px di bawah tepi layar sebelum animasi mulai
        mobile: true,
        live: false, // halaman ini statis, tidak perlu memantau DOM
      }).init();
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}