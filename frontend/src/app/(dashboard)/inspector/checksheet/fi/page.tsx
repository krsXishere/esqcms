"use client";

import { useState } from "react";

const visualItems = [
  "Hydrotest marking on casing",
  "Bolt tightening on casing",
  "Packing shaft condition",
  "Shaft/Impeller material (visual)",
  "Surface condition (visual)",
  "Painting quality",
  "Suction & flanges",
  "Coupling & guard",
  "Nameplate motor & stickers",
  "Final Inspection sticker",
];

export default function CreateFiChecksheetPage() {
  const [selected, setSelected] = useState<Record<number, string>>({});

  return (
    <div className="space-y-8 text-black">
      {/* HEADER */}
      <div className="space-y-1">
        <p className="text-xs text-gray-500">Checksheet &gt; Create New FI</p>
        <h1 className="text-xl font-semibold">Create New FI</h1>
      </div>

      {/* MODEL + AUTO FILLED INFORMATION (1 COLUMN / 1 CARD) */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        {/* MODEL */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-600">Model *</label>
          <select className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm">
            <option>Model Z</option>
          </select>
        </div>

        {/* AUTO FILLED INFORMATION */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Auto-Filled Information</h2>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <label className="text-xs text-gray-500">
                Customer Specification
              </label>
              <input
                disabled
                value="Flow: 100 m³/h, Head: 50m, Power: 15kW, RPM..."
                className="w-full mt-1 rounded-lg border border-gray-200 px-3 py-2 "
              />
            </div>

            <div>
              <label className="text-xs text-gray-500">Customer Name</label>
              <input
                disabled
                value="Brass Alloy"
                className="w-full mt-1 rounded-lg border border-gray-200 px-3 py-2 "
              />
            </div>

            <div>
              <label className="text-xs text-gray-500">Impeller Diameter</label>
              <input
                disabled
                value="250mm"
                className="w-full mt-1 rounded-lg border border-gray-200 px-3 py-2 "
              />
            </div>

            <div>
              <label className="text-xs text-gray-500">Quantity</label>
              <input
                disabled
                value="5"
                className="w-full mt-1 rounded-lg border border-gray-200 px-3 py-2 "
              />
            </div>

            <div>
              <label className="text-xs text-gray-500">No. FI</label>
              <input
                disabled
                value="FI-2025-0023"
                className="w-full mt-1 rounded-lg border border-gray-200 px-3 py-2 "
              />
            </div>

            <div>
              <label className="text-xs text-gray-500">Date</label>
              <input
                disabled
                value="2025-12-09"
                className="w-full mt-1 rounded-lg border border-gray-200 px-3 py-2 "
              />
            </div>
          </div>
        </div>
      </div>

      {/* VISUAL INSPECTION CHECKLIST */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="text-sm font-semibold">Visual Inspection Checklist</h2>

        <div className="space-y-4">
          {visualItems.map((item, i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-lg p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm">{item}</p>

                <div className="flex gap-2">
                  {["Good", "N/A", "After Repair"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setSelected({ ...selected, [i]: opt })}
                      className={`px-3 py-1 rounded-full text-xs border ${
                        selected[i] === opt
                          ? "bg-black text-white border-black"
                          : "border-gray-300 text-gray-600"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {i === 0 && (
                <div>
                  <label className="text-xs text-gray-500">Add Remark *</label>
                  <input
                    placeholder="Remarks"
                    className="w-full mt-1 rounded-md border border-gray-200 px-3 py-2 text-sm"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* MOTOR INFORMATION */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-2">
        <h2 className="text-sm font-semibold">Motor Information</h2>

        <div className="max-w-sm">
          <label className="text-gray-500 text-sm">
            Motor Nameplate Power (kW)
          </label>
          <input
            placeholder="Input number kW"
            className="w-full mt-1 rounded-md border border-gray-200 px-3 py-2"
          />
        </div>
      </div>

      {/* GENERAL NOTES */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-2">
        <h2 className="text-sm font-semibold">General Notes</h2>

        <textarea
          placeholder="Write notes or comments..."
          className="w-full h-28 rounded-md border border-gray-200 px-3 py-2 text-sm"
        />
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
