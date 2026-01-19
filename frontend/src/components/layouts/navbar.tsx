"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const linkClass = (href: string) =>
    pathname.startsWith(href)
      ? "px-4 py-1.5 rounded-full bg-gray-200 text-gray-900 font-medium"
      : "px-4 py-1.5 text-gray-600 hover:text-gray-900";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#F8FAFC] border-b flex items-center justify-between px-6">
      {/* LEFT */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
          LOGO
        </div>

        <div className="leading-tight">
          <div className="font-semibold text-sm text-gray-900">
            QC Checksheet
          </div>
          <div className="text-xs text-gray-500">Validator Portal</div>
        </div>
      </div>

      {/* CENTER */}
      <div className="hidden md:flex items-center">
        {/* background pill */}
        <div className="flex items-center gap-2 rounded-full bg-white px-2 py-1">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/supervisor/dashboard"
              className={linkClass("/supervisor/dashboard")}
            >
              Dashboard
            </Link>

            {/* DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => setOpen((v) => !v)}
                className={`inline-flex items-center gap-1 px-4 py-1.5 rounded-full transition ${
                  pathname.startsWith("/supervisor/checksheet") ||
                  pathname.startsWith("/checksheet")
                    ? "bg-gray-200 text-gray-900 font-medium"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Checksheet
                <svg
                  className={`w-3 h-3 transition ${open ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {open && (
                <div className="absolute left-0 mt-2 w-32 rounded-lg border bg-white shadow-md">
                  <Link
                    href="/supervisor/checksheet/fi"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    FI
                  </Link>
                  <Link
                    href="/supervisor/checksheet/dir"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    DIR
                  </Link>
                </div>
              )}
            </div>

            <Link href="/supervisor/analytics/dir" className={linkClass("/supervisor/analytics/dir")}>
              Analytics
            </Link>
          </nav>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-700">
          SAP
        </div>

        <div className="leading-tight text-right">
          <div className="text-sm font-medium text-gray-900">
            Sareh Azis Panegar
          </div>
          <div className="text-xs text-gray-500">QC Validator</div>
        </div>
      </div>
    </header>
  );
}
