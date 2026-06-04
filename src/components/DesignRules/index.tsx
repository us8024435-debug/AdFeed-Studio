/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Plus, Trash2, Settings, Sliders, Check, HelpCircle } from "lucide-react";
import { DesignRule } from "../../types/product.ts";

interface DesignRulesProps {
  rules: DesignRule[];
  onChange: (rules: DesignRule[]) => void;
}

export default function DesignRules({ rules, onChange }: DesignRulesProps) {
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [condition, setCondition] = useState<"discount_gt" | "out_of_stock" | "always">("discount_gt");
  const [threshold, setThreshold] = useState<number>(20);
  const [badge, setBadge] = useState<"SALE" | "OUT OF STOCK" | "NEW" | "HOT">("SALE");
  const [selectedColor, setSelectedColor] = useState<string>("#FF4D00"); // Default brand orange

  const presetColors = [
    { value: "#FF4D00", label: "Studio Orange" },
    { value: "#E11D48", label: "Meta Red" },
    { value: "#25F4EE", label: "TikTok Teal" },
    { value: "#34A853", label: "Google Green" },
    { value: "#000000", label: "Deep Black" },
    { value: "#1E293B", label: "Slate Blue" },
  ];

  const handleAddRule = () => {
    const newRule: DesignRule = {
      id: "rule-" + Date.now().toString(),
      condition,
      threshold: condition === "discount_gt" ? threshold : undefined,
      badge,
      badgeColor: selectedColor,
    };

    onChange([...rules, newRule]);
    setShowForm(false);
    
    // Reset to defaults
    setCondition("discount_gt");
    setThreshold(20);
    setBadge("SALE");
    setSelectedColor("#FF4D00");
  };

  const handleDeleteRule = (id: string) => {
    const nextRules = rules.filter((r) => r.id !== id);
    onChange(nextRules);
  };

  return (
    <div className="bg-[#141416] border border-gray-800 rounded-xl p-5 shadow-xl text-left" id="design-rules-control">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b border-gray-800/80 pb-3" id="rules-inner-header">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-wide uppercase flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#FF4D00]" />
            Dynamic Design Overlays
          </h3>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Auto-apply structural badge overlays onto live ad templates
          </p>
        </div>
        
        {!showForm && (
          <button
            id="btn-trigger-add-rule"
            onClick={() => setShowForm(true)}
            className="py-1.5 px-3 bg-[#1C1C1E] border border-gray-800 hover:border-gray-700 hover:text-white text-gray-300 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-[#FF4D00]" /> Add Rule
          </button>
        )}
      </div>

      {/* Rules list */}
      <div className="space-y-2 mb-4" id="rules-collection-list">
        {rules.length === 0 ? (
          <p className="text-xs text-gray-500 italic p-3 bg-black/25 text-center rounded-lg border border-dashed border-gray-850">
            No active design rules are enabled. Add a rule to trigger badge stickers.
          </p>
        ) : (
          rules.map((rule) => {
            let condText = "";
            if (rule.condition === "always") condText = "Show Always";
            if (rule.condition === "out_of_stock") condText = "Product is Out Of Stock";
            if (rule.condition === "discount_gt") {
              condText = `Discount exceeds ${rule.threshold || 0}%`;
            }

            return (
              <div
                key={rule.id}
                id={`design-rule-item-${rule.id}`}
                className="flex items-center justify-between p-2.5 px-3 bg-[#0A0A0B] border border-gray-850 rounded-lg group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Miniature decorative sticker preview */}
                  <span
                    style={{ backgroundColor: rule.badgeColor }}
                    className="px-2 py-0.5 rounded text-[8px] font-black text-white tracking-widest uppercase shrink-0 shadow-sm"
                  >
                    {rule.badge}
                  </span>
                  
                  <div className="min-w-0">
                    <p className="text-[11px] font-mono text-gray-300 leading-tight">
                      {condText}
                    </p>
                  </div>
                </div>

                <button
                  id={`delete-rule-${rule.id}`}
                  onClick={() => handleDeleteRule(rule.id)}
                  className="p-1 text-gray-600 hover:text-red-400 rounded hover:bg-red-950/20 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove Rule option"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Input Creator Form Overlay Inline */}
      {showForm && (
        <div className="p-4 bg-[#0A0A0B]/80 border border-[#FF4D00]/20 rounded-lg space-y-4 mb-1 animate-fadeIn" id="rule-creator-form">
          <div className="flex items-center justify-between border-b border-gray-800 pb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-white">
              Create Ad Badge Rule
            </span>
          </div>

          {/* Condition Select dropdown */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono">
              Apply Indicator Condition
            </label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value as any)}
              className="w-full bg-[#141416] border border-gray-800 rounded px-2.5 py-1.5 text-xs text-white uppercase focus:outline-none focus:border-[#FF4D00] cursor-pointer"
              id="select-condition"
            >
              <option value="discount_gt">🏷️ Discount exceeds X%</option>
              <option value="out_of_stock">🪵 Out of Stock</option>
              <option value="always">🌟 Show Badge Always</option>
            </select>
          </div>

          {/* Threshold input (Only shown for discount condition) */}
          {condition === "discount_gt" && (
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono">
                Compare Percent Discount Threshold
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={threshold}
                  onChange={(e) => setThreshold(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#141416] border border-gray-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#FF4D00] font-mono"
                  id="input-threshold"
                />
                <span className="absolute right-2.5 top-1.5 text-gray-500 text-xs font-mono">
                  % OFF
                </span>
              </div>
            </div>
          )}

          {/* Badge Label drop down select */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono">
              Sticker Badge Text Label
            </label>
            <select
              value={badge}
              onChange={(e) => setBadge(e.target.value as any)}
              className="w-full bg-[#141416] border border-gray-800 rounded px-2.5 py-1.5 text-xs text-white uppercase focus:outline-none focus:border-[#FF4D00] cursor-pointer"
              id="select-badge"
            >
              <option value="SALE">🔥 SALE</option>
              <option value="HOT">👑 HOT</option>
              <option value="NEW">⚡ NEW</option>
              <option value="OUT OF STOCK">🪵 OUT OF STOCK</option>
            </select>
          </div>

          {/* Theme badge color pickers preset */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono mb-1.5">
              Badge Brand Tint Color
            </label>
            <div className="flex flex-wrap gap-2" id="badge-color-tiles shadow-inner">
              {presetColors.map((color) => {
                const isSelected = selectedColor === color.value;
                return (
                  <button
                    key={color.value}
                    type="button"
                    title={color.label}
                    onClick={() => setSelectedColor(color.value)}
                    style={{ backgroundColor: color.value }}
                    className={`w-7 h-7 rounded-md transition-transform flex items-center justify-center cursor-pointer border relative ${
                      isSelected 
                        ? "scale-110 border-white" 
                        : "border-gray-800 hover:scale-105"
                    }`}
                  >
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-white mix-blend-difference" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Controls buttons */}
          <div className="flex gap-2 justify-end pt-2 border-t border-gray-800">
            <button
              onClick={() => setShowForm(false)}
              className="py-1.5 px-3 border border-gray-800 text-gray-400 hover:text-white rounded-lg text-xs font-medium cursor-pointer"
              id="btn-cancel-rule"
            >
              Cancel
            </button>
            <button
              onClick={handleAddRule}
              className="py-1.5 px-3 bg-[#FF4D00] hover:bg-[#E04400] text-white rounded-lg text-xs font-semibold cursor-pointer"
              id="btn-confirm-add-rule"
            >
              Save Rule
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
