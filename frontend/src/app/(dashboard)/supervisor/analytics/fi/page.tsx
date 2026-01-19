"use client";

import { Download, AlertTriangle } from "lucide-react";
import {
  ClipboardDocumentListIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  ShieldExclamationIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";
import { useRouter, usePathname } from "next/navigation";

import MiniTrend from "@/components/charts/MiniTrend";
import ParetoFI from "@/components/charts/ParetoFI";
import FITrend from "@/components/charts/FITrend";

export default function FiAnalyticsPage() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="space-y-6 text-black">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">QC Analytics – FI</h1>
          <p className="text-sm text-gray-500">
            Final Inspection quality analytics and after repair effectiveness
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
          Applied: FI – Model X – Line A – Jan–Mar 2025
        </p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col gap-1">
          <ClipboardDocumentListIcon className="w-6 h-6 text-gray-400" />
          <p className="text-xs text-gray-400">Total Checksheet</p>
          <p className="text-xl font-semibold">428</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col gap-1">
          <ExclamationCircleIcon className="w-6 h-6 text-gray-400" />
          <p className="text-xs text-gray-400">NG Rate</p>
          <p className="text-xl font-semibold">14.2%</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col gap-1">
          <ExclamationTriangleIcon className="w-6 h-6 text-gray-400" />
          <p className="text-xs text-gray-400">Worst Cpk</p>
          <div className="flex items-center gap-2">
            <p className="text-xl font-semibold">0.87</p>
            <span className="text-[10px] px-2 py-1 rounded bg-gray-200">
              CRITICAL
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col gap-1">
          <ShieldExclamationIcon className="w-6 h-6 text-gray-400" />
          <p className="text-xs text-gray-400">Parameters at Risk</p>
          <p className="text-xl font-semibold">8</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center gap-2">
          <ArrowTrendingUpIcon className="w-6 h-6 text-gray-400" />
          <p className="text-xs text-gray-400">Trend (7 Days)</p>
          <MiniTrend />
        </div>
      </div>

      {/* Pareto full width */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h2 className="text-sm font-semibold mb-2">
          Pareto Chart – Defect Frequency (FI)
        </h2>
        <ParetoFI />
      </div>

      {/* PARETO + TREND */}
      <div className="grid grid-cols-2 gap-4">
        {/* FI Trend */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="text-sm font-semibold mb-2">
            FI Trend (NG Over Time)
          </h2>
          <FITrend />
        </div>

        {/* AFTER REPAIR EFFECTIVENESS */}
        {/* AFTER REPAIR EFFECTIVENESS */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="text-sm font-semibold mb-6">
            After Repair Effectiveness
          </h2>

          {/* CIRCLE */}
          <div className="flex justify-center mb-6">
            <div className="w-32 h-32 rounded-full border-8 border-gray-200 flex flex-col items-center justify-center">
              <p className="text-lg font-semibold">81.8%</p>
              <p className="text-[10px] text-gray-500">Success Rate</p>
            </div>
          </div>

          {/* CARDS */}
          <div className="grid grid-cols-3 gap-4">
            {[
              ["Total Repaired", 22],
              ["Fixed", 18],
              ["Returned NG", 4],
            ].map(([label, value]) => (
              <div
                key={label}
                className="bg-gray-100 rounded-lg p-4 text-center"
              >
                <p className="text-lg font-semibold">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FI ITEM ANALYSIS */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h2 className="text-sm font-semibold mb-3">FI Item Analysis</h2>

        <table className="w-full text-xs">
          <thead className="border-b border-gray-200 text-gray-600">
            <tr>
              {[
                "Item Name",
                "Good Count",
                "N/A Count",
                "After Repair",
                "Total Issues",
                "Issue Rate",
              ].map((h) => (
                <th key={h} className="py-2 text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["Hydrotest", 342, 12, 8, 20, "5.5%"],
              ["Bolts", 368, 5, 3, 8, "2.1%"],
              ["Packing", 375, 8, 5, 13, "3.4%"],
            ].map((row) => (
              <tr
                key={row[0]}
                className="border-b border-gray-100 last:border-0"
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

      {/* AFTER REPAIR INVESTIGATION */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h2 className="text-sm font-semibold mb-3">
          After Repair Investigation
        </h2>

        <table className="w-full text-xs">
          <thead className="border-b border-gray-200 text-gray-600">
            <tr>
              {[
                "Timestamp",
                "Checksheet ID",
                "Model",
                "Item Name",
                "Remark",
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
            <tr className="border-b border-gray-100">
              <td className="py-2">2025-01-09 10:15</td>
              <td>FI-2024-0302</td>
              <td>Model Y</td>
              <td>Shaft Seal</td>
              <td className="flex items-center gap-1 text-gray-600">
                <AlertTriangle size={12} />
                Missing Remark
              </td>
              <td>Rudi Hartono</td>
              <td>Open</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* QRI */}
      <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">
            Quality Risk Indicator (QRI)
          </h2>

          <span className="text-xs px-2 py-1 rounded-xl bg-gray-200">
            MEDIUM
          </span>
        </div>

        <p className="text-xs text-gray-400 mt-2">Risk Drivers:</p>

        {[
          "Shaft Diameter: Cp < 1.0 (Critical)",
          "Increasing NG trend observed (+2.1% vs last month)",
          "Frequent After Repair items in FI (18 cases)",
          "3 parameters approaching control limits",
        ].map((risk) => (
          <div
            key={risk}
            className="flex gap-2 text-xs bg-gray-100 rounded-md px-3 py-2"
          >
            <AlertTriangle size={14} className="text-gray-400" />
            {risk}
          </div>
        ))}
      </div>
    </div>
  );
}
