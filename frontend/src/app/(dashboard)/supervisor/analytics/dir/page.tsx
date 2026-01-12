"use client";

import { AlertTriangle, Download } from "lucide-react";
import HistogramSpec from "@/components/charts/HistogramSpec";
import WeeklyTrend from "@/components/charts/WeeklyTrend";
import {
  ClipboardDocumentListIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  ShieldExclamationIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";
import MiniTrend from "@/components/charts/MiniTrend";
import { useRouter, usePathname } from "next/navigation";

export default function DirAnalyticsPage() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="space-y-6 text-black">
      {/* HEADER */}
      <div className="flex items-center justify-between ">
        <div>
          <h1 className="text-xl font-semibold">QC Analytics – DIR / FI</h1>
          <p className="text-sm text-gray-500 ">
            Comprehensive quality control monitoring and statistical analysis
          </p>
        </div>

        <div className="flex gap-2">
          <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm bg-gray-200">
            <Download size={14} />
            Export
          </button>
          <button className="rounded-lg border px-4 py-2 text-sm border-gray-300 bg-gray-200">
            Help
          </button>
        </div>
      </div>

      {/* FILTER */}
      <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
        <div className="grid grid-cols-5 gap-3">
          <div>
            <label className="text-xs text-gray-500">Inspection Type</label>
            <div className="mt-1 flex rounded-md border border-gray-300 overflow-hidden text-sm">
              <button
                onClick={() => router.push("/supervisor/analytics/dir")}
                className={`flex-1 py-1 ${
                  pathname === "/supervisor/analytics/dir"
                    ? "bg-gray-200 font-semibold"
                    : "hover:bg-gray-100"
                }`}
              >
                DIR
              </button>

              <button
                onClick={() => router.push("/supervisor/analytics/fi")}
                className={`flex-1 py-1 ${
                  pathname === "/supervisor/analytics/fi"
                    ? "bg-gray-200 font-semibold"
                    : "hover:bg-gray-100"
                }`}
              >
                FI
              </button>
            </div>
          </div>

          {["Date Range", "Model", "Customer", "Production Line"].map(
            (label) => (
              <div key={label}>
                <label className="text-xs text-gray-500">{label}</label>
                <select className="mt-1 w-full rounded-md border border-gray-200 px-3 py-1.5 text-sm">
                  <option>Choose {label}</option>
                </select>
              </div>
            )
          )}
        </div>

        <p className="text-xs text-gray-500">
          Applied: DIR – Model X – Line A – Jan–Mar 2025
        </p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-5 gap-4">
        {/* Total Checksheet */}
        <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-left gap-1">
          <ClipboardDocumentListIcon className="w-6 h-6 text-gray-400" />
          <p className="text-xs text-gray-400">Total Checksheet</p>
          <p className="text-xl font-semibold text-gray-800">428</p>
        </div>

        {/* NG Rate */}
        <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-left gap-1">
          <ExclamationCircleIcon className="w-6 h-6 text-gray-400" />
          <p className="text-xs text-gray-400">NG Rate</p>
          <p className="text-xl font-semibold text-gray-800">14.2%</p>
        </div>

        {/* Worst Cpk */}
        <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-left gap-1">
          <ExclamationTriangleIcon className="w-6 h-6 text-gray-400" />
          <p className="text-xs text-gray-400">Worst Cpk</p>

          <div className="flex items-left gap-2">
            <p className="text-xl font-semibold text-gray-800">0.87</p>
            <span className="text-[10px] px-2 py-2 rounded bg-gray-200 text-gray-600">
              CRITICAL
            </span>
          </div>
        </div>

        {/* Parameters at Risk */}
        <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-left gap-1">
          <ShieldExclamationIcon className="w-6 h-6 text-gray-400" />
          <p className="text-xs text-gray-400">Parameters at Risk</p>
          <p className="text-xl font-semibold text-gray-800">8</p>
        </div>

        {/* Trend 7 Days */}
        <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center gap-2">
          <ArrowTrendingUpIcon className="w-6 h-6 text-gray-400" />
          <p className="text-xs text-gray-400">Trend (7 Days)</p>

          <MiniTrend />
        </div>
      </div>

      {/* PROCESS CAPABILITY */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h2 className="text-sm font-semibold mb-3">
          Process Capability Analysis
        </h2>

        <table className="w-full text-xs">
          <thead className="text-black border-b border-gray-200">
            <tr>
              {[
                "Parameter",
                "LSL",
                "USL",
                "Mean",
                "σ (sigma)",
                "Cp",
                "Cpk",
                "Status",
              ].map((h) => (
                <th key={h} className="py-2 text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {[
              [
                "Housing Length",
                "49.85",
                "50.15",
                "50.02",
                "0.045",
                "1.67",
                "1.56",
                "GOOD",
              ],
              [
                "Shaft Diameter",
                "24.95",
                "25.05",
                "25.03",
                "0.028",
                "0.89",
                "0.87",
                "CRITICAL",
              ],
              [
                "Bearing Clearance",
                "0.02",
                "0.08",
                "0.045",
                "0.012",
                "1.25",
                "1.18",
                "WARNING",
              ],
            ].map((row) => (
              <tr
                key={row[0]}
                className="border-b border-gray-200 last:border-0"
              >
                {row.map((cell, i) => (
                  <td key={i} className="py-2">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 h-90">
          <h2 className="text-sm font-semibold mb-2">
            Histogram vs Specification
          </h2>
          <HistogramSpec />
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 h-90">
          <h2 className="text-sm font-semibold mb-2">
            Trend Over Time (Weekly)
          </h2>
          <WeeklyTrend />
        </div>
      </div>

      {/* INSIGHTS */}
      <div className="bg-white rounded-xl shadow-sm p-4 space-y-2">
        <h2 className="text-sm font-semibold">Automated Insights Summary</h2>

        {[
          "Shaft Diameter mean approaching USL since week 4 (+0.05mm drift)",
          "Variation in Bearing Clearance increased by 18% in last 2 weeks",
          "High NG risk for Shaft Diameter if no process adjustment applied",
        ].map((text) => (
          <div
            key={text}
            className="flex items-start gap-2 rounded-md bg-gray-100 px-3 py-2 text-xs text-gray-600"
          >
            <AlertTriangle size={14} className="mt-0.5 text-gray-400" />
            <span>{text}</span>
          </div>
        ))}
      </div>

      {/* OUT OF SPEC */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h2 className="text-sm font-semibold mb-3">Out-of-Spec Entries</h2>

        <table className="w-full text-xs">
          <thead className="text-gray-500 border-b border-gray-200">
            <tr>
              {[
                "Timestamp",
                "Checksheet ID",
                "Model",
                "Parameter",
                "Value",
                "Deviation",
                "Operator",
                "Action",
              ].map((h) => (
                <th key={h} className="py-2 text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {[
              [
                "2025-01-08 14:23",
                "DIR-2025-0142",
                "Model X",
                "Shaft Diameter",
                "25.08",
                "+0.03",
                "John Doe",
                "Open",
              ],
            ].map((row) => (
              <tr key={row[0]} className="border-b border-gray-200">
                {row.map((cell, i) => (
                  <td key={i} className="py-2">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {/* FOOTER */}
        <div className="flex items-center justify-between px-4 py-3 text-xs text-gray-500">
          <span>Showing 1–3 of 24 results</span>

          {/* PAGINATION */}
          <div className="flex items-center gap-1">
            <button className="px-2 py-1 rounded border hover:bg-gray-100">
              ‹
            </button>

            {[1, 2, 3].map((p) => (
              <button
                key={p}
                className={`px-3 py-1 rounded border ${
                  p === 1 ? "bg-gray-300 text-white" : "hover:bg-gray-100"
                }`}
              >
                {p}
              </button>
            ))}

            <button className="px-2 py-1 rounded border hover:bg-gray-100">
              ›
            </button>
          </div>
        </div>
      </div>

      {/* QRI */}
      <div className="bg-white rounded-xl shadow-sm p-4 space-y-2">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-sm font-semibold">
              Quality Risk Indicator (QRI)
            </h2>
            <p className="text-xs text-gray-400 mt-4">Risk Drivers:</p>
          </div>

          <span className="text-xs px-2 py-0.5 rounded bg-gray-200">
            MEDIUM
          </span>
        </div>

        {[
          "Shaft Diameter: Cp < 1.0 (Critical)",
          "Increasing NG trend observed (+2.1% vs last month)",
          "Frequent After Repair items in FI (18 cases)",
        ].map((risk) => (
          <div key={risk} className="flex gap-2 text-xs text-gray-600">
            <AlertTriangle size={14} />
            {risk}
          </div>
        ))}
      </div>
    </div>
  );
}
