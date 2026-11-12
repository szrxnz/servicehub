"use client";

import { useEffect, useRef, useState } from "react";

/** แสดงตัวเลขที่ค่อย ๆ วิ่งขึ้นจากค่าเดิมไปค่าใหม่ */
export function CountUp({ value, duration = 700 }: { value: number; duration?: number }) {
  const [shown, setShown] = useState(0);
  const last = useRef(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const total = reduced ? 1 : duration;
    const begin = last.current;
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const t = Math.min((now - start) / total, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = Math.round(begin + (value - begin) * eased);
      last.current = current;
      setShown(current);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <>{shown}</>;
}
