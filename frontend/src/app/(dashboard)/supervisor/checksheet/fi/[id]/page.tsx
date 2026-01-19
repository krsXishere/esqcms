"use client";

import { AlertTriangle } from "lucide-react";

export default function FiReviewPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6 text-black">
      {/* HEADER */}
      <div className="space-y-1">
        <p className="text-xs text-gray-500">
          Checksheet &gt; Review Checksheet
        </p>

        <h1 className="text-xl font-semibold">
          Checksheet Review: FI-2025-0015
        </h1>

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">Model X</p>

          <div className="flex items-center gap-1 text-xs text-gray-700 border border-gray-300 bg-gray-200 rounded-lg px-2 py-1">
            <AlertTriangle size={14} />
            <span className="font-medium">2 NG Items</span>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="space-y-6">
        {/* HEADER INFORMATION */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="text-sm font-semibold mb-4">Header Information</h2>

          <div className="grid grid-cols-3 gap-x-6 gap-y-4 text-xs">
            {/* COLUMN 1 */}
            <div className="space-y-3">
              <Info label="Model / Type" value="KSB ETANORM 080-250" />
              <Info label="Customer Name" value="PT. Pertamina Hulu Energi" />
              <Info label="Operator Name" value="Sareh Azis Panegara" />
            </div>

            {/* COLUMN 2 */}
            <div className="space-y-3">
              <div>
                <p className="text-gray-500">Customer Specification</p>
                <p className="font-medium">Flow: 150 m³/h, Head: 35 m</p>
                <p className="font-medium">15 kW @ 1450 RPM</p>
              </div>

              <Info label="No. FI" value="FI-PHE-2024-301" />
            </div>

            {/* COLUMN 3 */}
            <div className="space-y-3">
              <Info label="Impeller Diameter" value="245 mm" />
              <Info label="Submit Time" value="2024-12-09 14:30" />
            </div>
          </div>
        </div>

        {/* VISUAL INSPECTION RESULTS */}
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
          <h2 className="text-sm font-semibold">Visual Inspection Results</h2>

          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-4 py-2 text-left">Item Name</th>
                  <th className="px-0 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Casing surface finish", "Good", "-"],
                  [
                    "Impeller vane condition",
                    "After Repair",
                    "Minor burr removed from trailing edge",
                  ],
                  ["Shaft end surface", "Good", "-"],
                  ["Bearing housing alignment", "Good", "-"],
                  [
                    "Coupling face runout",
                    "After Repair",
                    "Re-machined to spec, verified with dial indicator",
                  ],
                  ["Nameplate legibility", "Good", "-"],
                  ["Paint finish quality", "N/A", "-"],
                  ["Foundation bolt holes", "Good", "-"],
                ].map(([item, status, remark], i) => (
                  <tr key={i} className="border-t border-gray-200">
                    <td className="px-4 py-2">{item}</td>
                    <td className="text-left">
                      <span className="px-2 py-0.5 rounded-full bg-gray-200 text-[10px] text-gray-700">
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-500">{remark}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* NUMERIC FIELD */}
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
          <h2 className="text-sm font-semibold">Numeric Field</h2>

          <div className="flex items-center gap-3 text-xs">
            <p className="text-gray-500">Motor Nameplate Power (kW):</p>

            <div className="px-3 py-1 border border-gray-300 rounded-md bg-gray-50 font-medium text-gray-700">
              15
            </div>
          </div>
        </div>

        {/* GENERAL NOTES */}
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
          <h2 className="text-sm font-semibold">General Notes</h2>

          <div className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-3 leading-relaxed">
            Pump assembled per customer drawing rev. C. All torque values
            recorded. Hydrostatic test passed at 1.5× rated pressure for 10
            minutes with no leaks detected.
          </div>
        </div>

        {/* ACTION */}
        <div className="flex justify-end gap-3">
          <button className="px-4 py-2 text-xs border border-gray-300 rounded-lg bg-gray-200 hover:bg-gray-400">
            Request Revision
          </button>

          <button className="px-4 py-2 text-xs rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-400">
            Approve
          </button>
        </div>
      </div>
    </div>
  );
}

/* SMALL COMPONENT */
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-gray-500">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
