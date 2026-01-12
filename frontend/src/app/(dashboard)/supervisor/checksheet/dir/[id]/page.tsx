"use client";

import { useState } from "react";
import { ZoomIn, ZoomOut, Maximize2, X } from "lucide-react";
import { CheckCircle, AlertTriangle } from "lucide-react";

export default function DirReviewPage({ params }: { params: { id: string } }) {
  const [zoom, setZoom] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const zoomPercent = Math.round(zoom * 100);

  const DrawingContent = (
    <div className="relative bg-gray-100 rounded-lg overflow-hidden h-80">
      {/* IMAGE */}
      <div className="w-full h-full flex items-center justify-center">
        <img
          src="/drawing-sample.png"
          alt="Drawing"
          className="transition-transform"
          style={{ transform: `scale(${zoom})` }}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 text-black">
      <div className="flex flex-col gap-1">
        {/* BREADCRUMB */}
        <p className="text-xs text-gray-500">
          Checksheet &gt; Review Checksheet
        </p>

        {/* TITLE */}
        <h1 className="text-xl font-semibold">Checksheet Review: #</h1>

        {/* SUBTITLE / MODEL */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">Model X</p>

          {/* NG WARNING */}
          <div className="flex items-center gap-1 text-xs text-gray-700 border border-gray-300 bg-gray-200 rounded-lg px-2 py-1">
            <AlertTriangle size={14} />
            <span className="font-medium">2 NG Items</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* LEFT */}
        <div className="col-span-8 space-y-6">
          {/* DRAWING */}
          <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
            {/* HEADER BAR (FIGMA STYLE) */}
            <div className="flex items-center justify-between">
              <div className="leading-tight">
                <h2 className="text-sm font-semibold">Drawing</h2>
                <p className="text-[11px] text-gray-500 py-1">
                  Model X – Type A – Brake Assembly
                </p>
              </div>

              <div
                className="flex items-center gap-2 bg-gray-50 border-gray-400
 rounded-lg px-2 py-1"
              >
                {/* ZOOM OUT */}
                <button
                  onClick={() => setZoom((z) => Math.max(z - 0.1, 0.5))}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <ZoomOut size={14} />
                </button>

                {/* PERCENT */}
                <div className="w-14 text-center text-xs font-medium text-gray-700">
                  {zoomPercent}%
                </div>

                {/* ZOOM IN */}
                <button
                  onClick={() => setZoom((z) => Math.min(z + 0.1, 2))}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <ZoomIn size={14} />
                </button>

                {/* DIVIDER */}
                <div className="w-px h-4 bg-gray-300 mx-1" />

                {/* FULLSCREEN */}
                <button
                  onClick={() => setFullscreen(true)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <Maximize2 size={14} />
                </button>
              </div>
            </div>

            {/* DRAWING AREA (TIDAK DIUBAH) */}
            {DrawingContent}
          </div>

          {/* HEADER INFORMATION */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h2 className="text-sm font-semibold mb-4">Header Information</h2>

            <div className="grid grid-cols-3 gap-x-6 gap-y-4 text-xs">
              {/* COLUMN 1 */}
              <div className="space-y-3">
                <div>
                  <p className="text-gray-500">Model</p>
                  <p className="font-medium">Model X</p>
                </div>
                <div>
                  <p className="text-gray-500">Material</p>
                  <p className="font-medium">Aluminium Alloy 6061</p>
                </div>
                <div>
                  <p className="text-gray-500">Serial Number</p>
                  <p className="font-medium">SN-20241204-001</p>
                </div>
                <div>
                  <p className="text-gray-500">Part Number</p>
                  <p className="font-medium">FPA-2024-001</p>
                </div>
              </div>

              {/* COLUMN 2 */}
              <div className="space-y-3">
                <div>
                  <p className="text-gray-500">Type</p>
                  <p className="font-medium">Type A</p>
                </div>
                <div>
                  <p className="text-gray-500">Customer / Supplier</p>
                  <p className="font-medium">PT. Toyota Astra Motor</p>
                </div>
                <div>
                  <p className="text-gray-500">Section</p>
                  <p className="font-medium">Machining</p>
                </div>
                <div>
                  <p className="text-gray-500">Date</p>
                  <p className="font-medium">2024-12-04</p>
                </div>
              </div>

              {/* COLUMN 3 */}
              <div className="space-y-3">
                <div>
                  <p className="text-gray-500">Part Name</p>
                  <p className="font-medium">Brake Assembly</p>
                </div>
                <div>
                  <p className="text-gray-500">Shift</p>
                  <p className="font-medium">Day Shift</p>
                </div>
                <div>
                  <p className="text-gray-500">Surat Jalan</p>
                  <p className="font-medium">SJ-2024-1234</p>
                </div>
                <div>
                  <p className="text-gray-500">Inspector</p>
                  <p className="font-medium">Budi Santoso</p>
                </div>
              </div>
            </div>
          </div>

          {/* MEASUREMENT DATA */}
          <div className="bg-white rounded-xl shadow-sm p-4 space-y-5">
            <h2 className="text-sm font-semibold">Measurement Data</h2>

            {/* NG ITEMS */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} className="text-gray-600" />
                <p className="text-xs font-medium text-gray-700">
                  NG Items (1)
                </p>
              </div>

              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 text-gray-500">
                    <tr>
                      <th className="px-4 py-2 text-left">Dimension</th>
                      <th className="px-4 py-2 text-center">Nominal</th>
                      <th className="px-4 py-2 text-center">Tol.Min</th>
                      <th className="px-4 py-2 text-center">Tol.Max</th>
                      <th className="px-4 py-2 text-center">Actual</th>
                      <th className="px-4 py-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-gray-200">
                      <td className="px-4 py-2">Overall Length</td>
                      <td className="text-center">250.00</td>
                      <td className="text-center">-0.03</td>
                      <td className="text-center">+0.03</td>
                      <td className="text-center">250.08</td>
                      <td className="text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 text-[10px]">
                          <AlertTriangle size={10} />
                          NG
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* OK ITEMS */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-gray-600" />
                <p className="text-xs font-medium text-gray-700">
                  OK Items (4)
                </p>
              </div>

              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 text-gray-500">
                    <tr>
                      <th className="px-4 py-2 text-left">Dimension</th>
                      <th className="px-4 py-2 text-center">Nominal</th>
                      <th className="px-4 py-2 text-center">Tolerance</th>
                      <th className="px-4 py-2 text-center">Tolerance</th>
                      <th className="px-4 py-2 text-center">Actual</th>
                      <th className="px-4 py-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="border-t border-gray-200">
                        <td className="px-4 py-2">Width</td>
                        <td className="text-center">120.00</td>
                        <td className="text-center">±0.03</td>
                        <td className="text-center">±0.03</td>
                        <td className="text-center">120.01</td>
                        <td className="text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 text-[10px]">
                            <CheckCircle size={10} />
                            OK
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {/* INSPECTOR RECOMMENDATION */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h2 className="text-sm font-semibold mb-2">
              Inspector Recommendation
            </h2>
            <p className="text-xs text-gray-500">
              Use As Is - Deviations are minor and within acceptable engineering
              limits
            </p>
          </div>

          {/* GENERAL NOTES */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h2 className="text-sm font-semibold mb-2">General Notes</h2>
            <p className="text-xs text-gray-500">
              Material certificate verified. No surface defects observed.
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="col-span-4 space-y-6">
          {/* NG SUMMARY */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h2 className="text-sm font-semibold mb-3">NG Summary</h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Total NG Items</span>
                <span className="font-medium">2</span>
              </div>

              {/* NG DETAILS */}
              <div className="space-y-2 ">
                {/* Overall Length */}
                <div className="border rounded-lg p-2 bg-gray-50 border-gray-300">
                  <p className="font-medium">Overall Length</p>
                  <p className="text-gray-500">
                    Actual: 250.08 <br />
                    Out of upper tolerance limit by 0.03mm
                  </p>
                </div>

                {/* Hole Diameter A */}
                <div className="border rounded-lg p-2 bg-gray-50 border-gray-300">
                  <p className="font-medium">Hole Diameter A</p>
                  <p className="text-gray-500">
                    Actual: 7.98 <br />
                    Below lower tolerance limit
                  </p>
                </div>
              </div>

              {/* INSPECTOR RECOMMENDATION */}
              <div>
                <p className="font-medium">Inspector Recommendation</p>
                <p className="text-gray-500">
                  Use As Is - Deviations are minor and within acceptable
                  engineering limits
                </p>
              </div>
            </div>
          </div>

          {/* REVISION NOTES */}
          <div className="bg-white rounded-xl shadow-sm p-4 ">
            <h2 className="text-sm font-semibold mb-3">Revision Notes</h2>
            <textarea
              className="w-full h-28 text-xs border rounded-lg p-2 focus:ring-1 focus:ring-gray-300 border-gray-300"
              placeholder="Enter notes for revision request..."
            />
          </div>

          {/* ACTION */}
          <div className="bg-white rounded-xl shadow-sm p-4 space-y-2">
            <button className="w-full bg-black text-white text-sm py-2 rounded-lg hover:opacity-90 flex items-center justify-center gap-2">
              <CheckCircle size={16} />
              Approve DIR
            </button>

            <button className="w-full border border-gray-300 text-sm py-2 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
              <AlertTriangle size={16} />
              Request Revision
            </button>
          </div>
        </div>
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
