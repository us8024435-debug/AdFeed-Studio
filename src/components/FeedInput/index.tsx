/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, ChangeEvent, DragEvent } from "react";
import { Upload, FileCode, CheckCircle, AlertTriangle, Play, RefreshCw, Trash2 } from "lucide-react";
import { Product, FeedValidationError } from "../../types/product.ts";

interface FeedInputProps {
  onParseJson: (json: string) => Promise<boolean>;
  onParseCsv: (file: File) => Promise<boolean>;
  onLoadSample: () => Promise<boolean>;
  onClear: () => void;
  productsCount: number;
  loading: boolean;
  errors: FeedValidationError[];
  apiError: string | null;
}

export default function FeedInput({
  onParseJson,
  onParseCsv,
  onLoadSample,
  onClear,
  productsCount,
  loading,
  errors,
  apiError,
}: FeedInputProps) {
  const [activeTab, setActiveTab] = useState<"json" | "csv">("json");
  const [jsonText, setJsonText] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parseSuccessMsg, setParseSuccessMsg] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleJsonChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setJsonText(e.target.value);
  };

  const handleJsonSubmit = async () => {
    if (!jsonText.trim()) return;
    setParseSuccessMsg(null);
    const success = await onParseJson(jsonText);
    if (success) {
      setParseSuccessMsg("JSON Feed successfully validated and parsed!");
    }
  };

  const handleLoadSampleLocal = async () => {
    setParseSuccessMsg(null);
    const success = await onLoadSample();
    if (success) {
      setParseSuccessMsg("Loaded sample e-commerce catalog successfully!");
      setJsonText(
        JSON.stringify(
          [
            {
              id: "jacket-001",
              title: "Heritage Soft Leather Bomber Jacket - Vintage Amber",
              brand: "Aero & Co. New York",
              price: 149.00,
              original_price: 220.00,
              currency: "USD",
              image_url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80",
              category: "Apparel",
              in_stock: true
            },
            {
              id: "cup-772",
              title: "Handcrafted Matte Ceramic Mug in Ochre",
              brand: "Ochre Studio Japan",
              price: 32.00,
              currency: "USD",
              image_url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80",
              category: "Kitchen & Home",
              in_stock: true
            }
          ],
          null,
          2
        )
      );
    }
  };

  const processFile = async (file: File) => {
    setSelectedFile(file);
    setParseSuccessMsg(null);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith(".csv") || file.type === "text/csv") {
        processFile(file);
      }
    }
  };

  const handleCsvSubmit = async () => {
    if (!selectedFile) return;
    setParseSuccessMsg(null);
    const success = await onParseCsv(selectedFile);
    if (success) {
      setParseSuccessMsg(`Parsed CSV catalog with ${selectedFile.name}`);
    }
  };

  const handleClearEverything = () => {
    onClear();
    setJsonText("");
    setSelectedFile(null);
    setParseSuccessMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="bg-[#141416] border border-gray-800 rounded-xl overflow-hidden shadow-xl" id="feed-input-widget">
      {/* Tab bar header */}
      <div className="flex border-b border-gray-800 bg-[#0E0E10]" id="feed-input-tabs">
        <button
          id="tab-json"
          onClick={() => setActiveTab("json")}
          className={`flex-1 py-3 text-center text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer border-b-2 flex items-center justify-center gap-2 ${
            activeTab === "json"
              ? "border-[#FF4D00] text-white bg-[#141416]"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          <FileCode className="w-4 h-4" />
          Paste JSON
        </button>
        <button
          id="tab-csv"
          onClick={() => setActiveTab("csv")}
          className={`flex-1 py-3 text-center text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer border-b-2 flex items-center justify-center gap-2 ${
            activeTab === "csv"
              ? "border-[#FF4D00] text-white bg-[#141416]"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          <Upload className="w-4 h-4" />
          Upload CSV Feed
        </button>
      </div>

      <div className="p-5" id="feed-input-content">
        {/* Tab Panel: JSON */}
        {activeTab === "json" && (
          <div className="space-y-4" id="panel-json-feed">
            <div className="relative">
              <textarea
                id="json-textarea"
                value={jsonText}
                onChange={handleJsonChange}
                placeholder="[&#10;  {&#10;    &quot;id&quot;: &quot;must-be-unique&quot;,&#10;    &quot;title&quot;: &quot;Heritage Leather Bomber Jacket&quot;,&#10;    &quot;brand&quot;: &quot;Aero New York&quot;,&#10;    &quot;price&quot;: 149.00,&#10;    &quot;image_url&quot;: &quot;https://...&quot;&#10;  }&#10;]"
                rows={8}
                className="w-full bg-[#0A0A0B] border border-gray-800 rounded-lg p-3 text-xs font-mono text-emerald-400 focus:outline-none focus:border-[#FF4D00] placeholder-gray-600 resize-none leading-relaxed"
              />
              <div className="absolute bottom-3 right-3 text-[10px] font-mono text-gray-500">
                {jsonText.length} characters
              </div>
            </div>

            <div className="flex gap-2 justify-between">
              <button
                id="btn-load-inline-sample"
                onClick={handleLoadSampleLocal}
                disabled={loading}
                className="py-2 px-3.5 border border-gray-800 text-gray-300 hover:text-white rounded-lg text-xs font-medium bg-[#1A1A1C] hover:bg-[#222226] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 text-[#FF4D00]" />
                Sample Catalog
              </button>

              <div className="flex gap-2">
                {productsCount > 0 && (
                  <button
                    id="btn-clear-feed"
                    onClick={handleClearEverything}
                    className="py-2 px-3 border border-red-950 text-red-400 hover:bg-red-950/25 rounded-lg text-xs font-medium cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Reset
                  </button>
                )}
                <button
                  id="btn-parse-json"
                  onClick={handleJsonSubmit}
                  disabled={loading || !jsonText.trim()}
                  className="py-2 px-4 bg-[#FF4D00] hover:bg-[#E04400] disabled:opacity-40 disabled:hover:bg-[#FF4D00] text-white rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                >
                  {loading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>Parse & Preview</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Panel: CSV */}
        {activeTab === "csv" && (
          <div className="space-y-4" id="panel-csv-feed">
            <div
              id="csv-dropzone"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                dragOver
                  ? "border-[#FF4D00] bg-[#FF4D00]/5"
                  : selectedFile
                  ? "border-emerald-500/50 bg-emerald-500/5"
                  : "border-gray-800 bg-[#0A0A0B] hover:border-gray-700"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload className="w-8 h-8 mx-auto mb-3 text-[#FF4D00]" />
              <span className="block text-xs font-semibold text-white mb-1">
                {selectedFile ? "Selected: " + selectedFile.name : "Drag & drop feed CSV file"}
              </span>
              <span className="block text-[11px] text-gray-500">
                {selectedFile
                  ? `Size: ${(selectedFile.size / 1024).toFixed(1)} KB`
                  : "Supports g:id, compare_at_price, image_link, sale_price namespaces"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              {selectedFile && (
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-gray-400 hover:text-red-400 text-xs flex items-center gap-1 cursor-pointer"
                  id="btn-remove-selected-csv"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear file
                </button>
              )}
              <div className="flex gap-2 ml-auto">
                {productsCount > 0 && !selectedFile && (
                  <button
                    id="btn-clear-feed-csv"
                    onClick={handleClearEverything}
                    className="py-2 px-3 border border-red-950 text-red-400 hover:bg-red-950/25 rounded-lg text-xs font-medium cursor-pointer"
                  >
                    Reset Content
                  </button>
                )}
                <button
                  id="btn-parse-csv"
                  onClick={handleCsvSubmit}
                  disabled={loading || !selectedFile}
                  className="py-2 px-4 bg-[#FF4D00] hover:bg-[#E04400] disabled:opacity-40 disabled:hover:bg-[#FF4D00] text-white rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                >
                  {loading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    "Parse CSV Feed"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Global Success Banner */}
        {parseSuccessMsg && productsCount > 0 && (
          <div
            id="success-parse-banner"
            className="mt-4 p-3.5 bg-emerald-950/40 border border-emerald-900 rounded-lg flex items-start gap-2.5"
          >
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <strong className="text-emerald-300 font-semibold block">{parseSuccessMsg}</strong>
              <span className="text-gray-300 mt-0.5 block">{productsCount} products compiled into previews.</span>
            </div>
          </div>
        )}

        {/* Api Server Parsing Error Message */}
        {apiError && (
          <div
            id="api-error-banner"
            className="mt-4 p-3.5 bg-red-950/40 border border-red-900 rounded-lg flex items-start gap-2.5"
          >
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <strong className="text-red-300 font-semibold block">Feed Format Error</strong>
              <span className="text-red-250 mt-0.5 block">{apiError}</span>
            </div>
          </div>
        )}

        {/* Field Level Schema Warnings */}
        {errors.length > 0 && (
          <div
            id="feed-warnings-collection"
            className="mt-4 border border-gray-805/40 bg-gray-900/20 rounded-lg text-xs overflow-hidden"
          >
            <div className="px-3.5 py-2 bg-[#1A1A1E] border-b border-gray-800 text-gray-300 font-medium flex justify-between items-center">
              <span>Feed Warning Diagnostics</span>
              <span className="bg-red-950/50 text-red-400 px-2 py-0.5 rounded text-[10px] uppercase font-mono">
                {errors.length} Issue{errors.length > 1 ? "s" : ""} Found
              </span>
            </div>
            <div className="max-h-40 overflow-y-auto divide-y divide-gray-800/65 font-mono text-[11px] p-1.5 space-y-1">
              {errors.map((err, idx) => (
                <div key={idx} className="p-1 px-2 hover:bg-black/25 flex items-start gap-2">
                  <span className="text-cyan-400 font-bold shrink-0">{err.product_id}</span>
                  <span className="text-[#FF4D00] font-sans font-medium shrink-0 uppercase text-[9px] bg-red-950 px-1 rounded">
                    {err.field}
                  </span>
                  <span className="text-gray-400">{err.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
