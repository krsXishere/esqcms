"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function DynamicTitle() {
  const pathname = usePathname();

  useEffect(() => {
    let firstSegment = pathname.split("/")[1];

    if (!firstSegment) {
      firstSegment = "dashboard";
    }

    // Mapping untuk path khusus
    const titleMap = {
      "analysis&diagnose": "Analisis & Diagnose",
      "alarm&notification": "Alarm & Notification",
    };

    let formatted;
    if (titleMap[firstSegment]) {
      formatted = titleMap[firstSegment];
    } else {
      formatted = firstSegment.charAt(0).toUpperCase() + firstSegment.slice(1);
    }

    document.title = `OPTIMUS | ${formatted}`;
  }, [pathname]);

  return null;
}
