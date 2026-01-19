"use client";

import { useState } from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

export default function CreateDirChecksheetPage() {
  const [zoom, setZoom] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [hasNG, setHasNG] = useState(false);

  const zoomPercent = Math.round(zoom * 100);

  return (
    <div className="space-y-6 text-black">
      {/* HEADER */}
      <div className="space-y-1">
        <p className="text-xs text-gray-500">
          Checksheet &gt; Create Checksheet &gt; DIR
        </p>
        <h1 className="text-xl font-semibold">Create New DIR</h1>
      </div>

      {/* TOP SECTION */}
      <div className="grid grid-cols-12 gap-6">
        {/* DRAWING */}
        <div className="col-span-7 bg-white rounded-xl shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Drawing</h2>
              <p className="text-xs text-gray-500">
                Model X – Type A – Brake Assembly
              </p>
            </div>

            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1">
              <button
                onClick={() => setZoom((z) => Math.max(z - 0.1, 0.5))}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <ZoomOut size={14} />
              </button>

              <span className="w-12 text-center text-xs font-medium">
                {zoomPercent}%
              </span>

              <button
                onClick={() => setZoom((z) => Math.min(z + 0.1, 2))}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <ZoomIn size={14} />
              </button>

              <div className="w-px h-4 bg-gray-300 mx-1" />

              <button
                onClick={() => setFullscreen(true)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <Maximize2 size={14} />
              </button>
            </div>
          </div>

          <div className="bg-gray-100 rounded-lg h-80 flex items-center justify-center">
            <img
              src="/drawing-sample.png"
              style={{ transform: `scale(${zoom})` }}
              className="transition-transform"
            />
          </div>
        </div>

        {/* AUTO-FILLED INFORMATION */}
        <div className="col-span-5 bg-white rounded-xl shadow-sm p-4 space-y-4">
          {/* TOP DROPDOWNS */}
          <div className="grid grid-cols-3 gap-4 text-xs">
            {["Model *", "Part Type *", "Part Name *"].map((label) => (
              <div key={label}>
                <label className="text-gray-500">{label}</label>
                <select className="w-full mt-1 rounded-md border border-gray-200 px-2 py-1">
                  <option>Select</option>
                </select>
              </div>
            ))}
          </div>

          {/* TITLE */}
          <h2 className="text-sm font-semibold">Auto-filled Information</h2>

          {/* AUTO FIELDS */}
          <div className="grid grid-cols-3 gap-4 text-xs">
            {[
              "Part Number",
              "Material",
              "Section",
              "Customer",
              "Supplier",
              "Date",
              "Shift",
              "Station",
              "Serial Number",
            ].map((label) => (
              <div key={label}>
                <label className="text-gray-500">{label}</label>
                <input
                  disabled
                  placeholder="..."
                  className="w-full mt-1 rounded-md border px-2 py-1 border-gray-200 text-gray-600"
                />
              </div>
            ))}

            {/* SURAT JALAN */}
            <div className="col-span-1">
              <label className="text-gray-500">Surat Jalan Number</label>
              <input
                disabled
                placeholder="..."
                className="w-full mt-1 rounded-md border px-2 py-1 border-gray-200 text-gray-600"
              />
            </div>

            <div className="col-span-2">
              <label className="text-gray-500">Surat Jalan Date</label>
              <input
                disabled
                placeholder="..."
                className="w-full mt-1 rounded-md border px-2 py-1 border-gray-200 text-gray-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* QUALITY INFORMATION */}
      <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Quality Information</h2>

          <button
            onClick={() => setHasNG((v) => !v)}
            className="text-xs text-gray-500 underline"
          >
            Toggle NG State
          </button>
        </div>

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
                {
                  item: "Overall Length",
                  spec: "150.0 mm",
                  min: "-0.5",
                  max: "+0.5",
                },
                {
                  item: "Width",
                  spec: "75.0 mm",
                  min: "-0.3",
                  max: "+0.3",
                },
                {
                  item: "Height",
                  spec: "50.0 mm",
                  min: "-0.2",
                  max: "+0.2",
                },
                {
                  item: "Hole Diameter",
                  spec: "12.0 mm",
                  min: "-0.1",
                  max: "+0.1",
                },
                {
                  item: "Surface Finish",
                  spec: "Ra 1.6",
                  min: "-0.4",
                  max: "+0.4",
                },
              ].map((row, i) => {
                const ngRow = hasNG && i === 0;

                const MeasureCell = ({ withNGExtra = false }) => (
                  <td className="px-2 py-2 align-top">
                    <input
                      placeholder="Value"
                      className="w-full mb-1 rounded border border-gray-200 px-2 py-1"
                    />

                    <div className="flex gap-1">
                      <button className="flex-1 rounded bg-gray-100 py-0.5 text-[10px]">
                        OK
                      </button>
                      <button className="flex-1 rounded bg-gray-100 py-0.5 text-[10px]">
                        NG
                      </button>
                    </div>

                    {ngRow && withNGExtra && (
                      <div className="mt-2 space-y-1">
                        <input
                          placeholder="Reject Reason"
                          className="w-full rounded border border-gray-200 px-2 py-1 text-[10px]"
                        />

                        <label className="flex items-center gap-2 text-[10px] text-gray-500 cursor-pointer">
                          <input type="file" className="hidden" />
                          <span className="rounded border border-gray-200 px-2 py-1">
                            Choose file
                          </span>
                        </label>
                      </div>
                    )}
                  </td>
                );

                return (
                  <tr key={i} className="border-t border-gray-200">
                    <td className="px-3 py-2">{row.item}</td>
                    <td className="text-center">{row.spec}</td>
                    <td className="text-center">{row.min}</td>
                    <td className="text-center">{row.max}</td>

                    <MeasureCell withNGExtra />
                    <MeasureCell />
                    <MeasureCell />
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* DECISION & NOTES */}
      <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
        <h2 className="text-sm font-semibold">Decision & Notes</h2>

        <select className="w-full border border-gray-200 rounded-md px-3 py-2 text-xs">
          <option>Select Recommendation</option>
          <option>Use As Is</option>
          <option>Rework</option>
          <option>Reject</option>
        </select>

        <textarea
          placeholder="General notes (optional)"
          className="w-full h-24 border border-gray-200 rounded-md px-3 py-2 text-xs"
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

      {/* FULLSCREEN DRAWING */}
      {fullscreen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-4 w-[90%] h-[90%] relative">
            <button
              onClick={() => setFullscreen(false)}
              className="absolute top-3 right-3"
            >
              <X />
            </button>
            <div className="w-full h-full flex items-center justify-center">
              <img
                src="/drawing-sample.png"
                className="max-h-full max-w-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
