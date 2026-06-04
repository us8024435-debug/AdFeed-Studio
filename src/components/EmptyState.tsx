/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Copy, Check, Info, FileText } from "lucide-react";

interface EmptyStateProps {
  onLoadSample: () => void;
  loading: boolean;
}

export default function EmptyState({ onLoadSample, loading }: EmptyStateProps) {
  const [copied, setCopied] = useState(false);

  const sampleJson = `[
  {
    "id": "prod-01",
    "title": "Vintage Suede Field Jacket - Timber Gold",
    "brand": "Timber & Forge",
    "price": 89.00,
    "original_price": 135.00,
    "currency": "USD",
    "image_url": "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80",
    "category": "Apparel",
    "in_stock": true
  },
  {
    "id": "prod-02",
    "title": "Minimalist Ceramic Mug - Terracotta",
    "brand": "Ochre Studio",
    "price": 28.00,
    "currency": "USD",
    "image_url": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80",
    "category": "Home Decor",
    "in_stock": true
  }
]`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sampleJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="catalog-empty-state"
      className="flex flex-col items-center justify-center p-8 bg-[#141416]/50 border border-dashed border-gray-800 rounded-xl"
    >
      <div className="w-16 h-16 rounded-full bg-[#1A1A1E] flex items-center justify-center text-gray-500 mb-6">
        <FileText className="w-8 h-8 text-[#FF4D00]" />
      </div>

      <h3 className="text-xl font-display font-medium text-white mb-2 tracking-tight">
        No Product Catalog Loaded
      </h3>
      <p className="text-gray-400 text-sm max-w-md text-center mb-6 leading-relaxed">
        Upload a product feed in either <strong className="text-white">CSV format</strong> or <strong className="text-white">JSON format</strong> to generate pixel-perfect, live-rendered social ad formats and shopping results.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm justify-center mb-8">
        <button
          id="btn-load-sample"
          onClick={onLoadSample}
          disabled={loading}
          className="flex-1 py-2.5 px-4 bg-[#FF4D00] hover:bg-[#E04400] disabled:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors shadow shadow-[#FF4D00]/20 cursor-pointer text-center"
        >
          {loading ? "Loading Catalog..." : "⚡ Play with Sample Data"}
        </button>
      </div>

      {/* Copyable snippet fold */}
      <div className="w-full max-w-lg border border-gray-800/80 rounded-lg bg-[#0A0A0B] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-[#141416] border-b border-gray-800/80">
          <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
            <Info className="w-3.5 h-3.5 text-[#FF4D00]" />
            <span>Structured Feed Schema Layout</span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 py-1 px-2.5 rounded hover:bg-gray-800 text-emerald-400 hover:text-emerald-300 font-mono text-xs transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy JSON</span>
              </>
            )}
          </button>
        </div>
        <pre className="p-4 text-[11px] font-mono text-gray-400 overflow-x-auto text-left max-h-48 leading-relaxed">
          {sampleJson}
        </pre>
      </div>
    </div>
  );
}
