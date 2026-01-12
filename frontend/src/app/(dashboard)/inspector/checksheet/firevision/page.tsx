"use client";

import { AlertTriangle } from "lucide-react";

export default function FiRevisionPage() {
  return (
    <div className="space-y-6 text-black">
      {/* HEADER */}
      <div className="space-y-1">
        <p className="text-xs text-gray-500">Checksheet &gt; FI Revision</p>
        <h1 className="text-xl font-semibold">FI Revision Required</h1>
        <p className="text-xs text-gray-500">
          Please review validator notes and correct the highlighted measurements
        </p>
      </div>

      {/* FOREMAN FEEDBACK */}
      <div className="bg-gray-100 rounded-xl shadow-sm p-5 space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
            <AlertTriangle size={16} className="text-gray-600" />
          </div>
          <div>
            <p className="text-sm font-semibold">
              Revision 1 – Foreman Feedback
            </p>
            <p className="text-xs text-gray-500">
              Sareh Azis Panegar (Foreman Checker) · 2024-12-03 16:45
            </p>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
          Several measurements are out of tolerance. Please re-measure the
          following items using calibrated equipment and update photos for NG
          items.
        </div>

        <p className="text-xs font-semibold text-gray-600">
          Items requiring correction:
        </p>

        <ul className="text-xs text-gray-600 list-disc pl-5 space-y-1">
          <li>Packing shaft condition</li>
          <li>Hole Diameter – All measurements require verification</li>
          <li>Surface Finish – Measure 3 needs re-inspection</li>
        </ul>
      </div>

      {/* FI INFORMATION (SAMA SEPERTI DIR) */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-6">
          <h2 className="text-sm font-semibold">FI Information</h2>
          <span className="text-xs text-gray-500">ID: FI-2024-0013</span>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          {[
            "Model",
            "Customer",
            "Project",
            "Pump Type",
            "Serial Number",
            "Power",
            "Capacity",
            "Head",
            "RPM",
            "Date",
            "Inspector",
            "Shift",
          ].map((label) => (
            <div key={label}>
              <label className="text-xs text-gray-500">{label}</label>
              <input
                disabled
                value="—"
                className="w-full mt-1 rounded-md border border-gray-200 px-3 py-2 bg-gray-100 text-gray-600"
              />
            </div>
          ))}
        </div>
      </div>

      {/* QUALITY INFORMATION */}
      <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
        <h2 className="text-sm font-semibold">Quality Information</h2>

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-3 py-2 text-left">Item</th>
                <th className="px-3 py-2 text-center">Spec</th>
                <th className="px-3 py-2 text-center">Tol.Min</th>
                <th className="px-3 py-2 text-center">Tol.Max</th>
                <th className="px-3 py-2 text-center">Measure 1</th>
                <th className="px-3 py-2 text-center">Measure 2</th>
                <th className="px-3 py-2 text-center">Measure 3</th>
              </tr>
            </thead>

            <tbody>
              {[
                "Overall Length",
                "Width",
                "Height",
                "Hole Diameter",
                "Surface Finish",
              ].map((item, i) => {
                const isNG = i === 1; // contoh item NG sama seperti DIR

                return (
                  <tr key={item} className="border-t border-gray-200">
                    <td className="px-3 py-2">{item}</td>
                    <td className="text-center">—</td>
                    <td className="text-center">—</td>
                    <td className="text-center">—</td>

                    {[1, 2, 3].map((m) => (
                      <td key={m} className="px-2 py-2 align-top">
                        <input
                          className={`w-full mb-1 rounded border px-2 py-1 ${
                            isNG
                              ? "border-gray-300"
                              : "border-gray-200 bg-gray-100"
                          }`}
                          placeholder="149.8"
                        />

                        <div className="flex gap-1">
                          <button className="flex-1 rounded bg-gray-100 py-0.5 text-[10px]">
                            OK
                          </button>
                          <button className="flex-1 rounded bg-gray-100 py-0.5 text-[10px]">
                            NG
                          </button>
                        </div>

                        {isNG && m === 1 && (
                          <div className="mt-2 space-y-1">
                            <input
                              placeholder="Reject Reason"
                              className="w-full rounded border border-gray-200 px-2 py-1 text-[10px]"
                            />
                            <label className="block text-[10px] text-gray-500">
                              <span className="inline-block border border-gray-200 rounded px-2 py-1 cursor-pointer">
                                Choose file
                              </span>
                              <input type="file" className="hidden" />
                            </label>
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* DECISION & NOTES (SAMA) */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="text-sm font-semibold">Decision & Notes</h2>

        <div>
          <label className="text-xs text-gray-500">Recommendation</label>
          <select className="w-full mt-1 rounded-md border border-gray-200 px-3 py-2 text-sm">
            <option>Accepted</option>
            <option>Rework</option>
            <option>Rejected</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-gray-500">General Notes</label>
          <textarea
            className="w-full mt-1 h-24 rounded-md border border-gray-200 px-3 py-2 text-sm"
            defaultValue="Re-inspection completed and issues addressed."
          />
        </div>
      </div>

      {/* ACTION */}
      <div className="bg-white rounded-xl shadow-sm p-6 flex justify-end">
        <button
          disabled
          className="rounded-lg bg-gray-300 px-6 py-2 text-sm text-white cursor-not-allowed"
        >
          Submit for Validation
        </button>
      </div>
    </div>
  );
}
