/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { MoreHorizontal, ChevronUp, Sparkles } from "lucide-react";
import { Product, DesignRule } from "../../types/product.ts";

interface AdPreviewProps {
  product: Product;
  rules: DesignRule[];
}

export default function MetaStoryAd({ product, rules }: AdPreviewProps) {
  const [imgError, setImgError] = useState(false);

  // Apply condition rules with strict precedence: out_of_stock > discount_gt > always
  const activeRule = (() => {
    const oosRule = rules.find(r => r.condition === "out_of_stock" && !product.in_stock);
    if (oosRule) return oosRule;
    
    const discountRule = rules.find(r => {
      if (r.condition !== "discount_gt") return false;
      const discount = product.discount_percent || 0;
      const threshold = r.threshold || 0;
      return discount > threshold;
    });
    if (discountRule) return discountRule;

    const alwaysRule = rules.find(r => r.condition === "always");
    return alwaysRule || null;
  })();

  return (
    <div
      id={`meta-story-${product.id}`}
      style={{ width: "225px", height: "400px" }}
      className="mx-auto bg-[#050505] rounded-xl overflow-hidden relative shadow-2xl border border-gray-850 flex flex-col justify-between font-sans group select-none"
    >
      {/* Dynamic ribbon top-left */}
      {activeRule && (
        <div className="absolute top-0 left-0 z-20 pointer-events-none overflow-hidden w-24 h-24">
          <div
            style={{ backgroundColor: activeRule.badgeColor }}
            className="absolute top-4 -left-7 w-28 py-1 uppercase text-[8px] font-black tracking-widest text-center text-white -rotate-45 shadow-sm shadow-black/40 border-b border-white/10"
          >
            {activeRule.badge}
          </div>
        </div>
      )}

      {/* Top Overlay: Story Bar Info */}
      <div className="absolute top-2.5 left-0 right-0 px-3 z-10 flex flex-col gap-1.5" id="story-top-panel">
        {/* Story segment lines */}
        <div className="flex gap-1">
          <div className="flex-1 h-[2px] rounded-full bg-white opacity-85" />
          <div className="flex-1 h-[2px] rounded-full bg-white/20" />
        </div>
        
        {/* Brand visual header */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 to-fuchsia-600 p-[1px]">
              <div className="w-full h-full rounded-full bg-[#141416] flex items-center justify-center font-display text-[8px] uppercase font-black text-rose-500">
                {product.brand.slice(0, 1)}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-white tracking-wide block truncate max-w-[120px]">
                {product.brand}
              </span>
              <span className="text-[7px] text-gray-300 block -mt-0.5 font-mono">Sponsored</span>
            </div>
          </div>
          <button className="text-white hover:opacity-80 cursor-pointer">
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Full Bleed Image Frame with fallback bounds */}
      <div className="absolute inset-0 z-0 bg-[#141416]" id="story-bleed-frame">
        {imgError || !product.image_url ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-950 text-gray-500 font-mono text-[10px] p-4 text-center">
            <Sparkles className="w-6 h-6 text-gray-700 mb-2" />
            <span>Product Media Error</span>
            <span className="text-[8px] text-gray-700 mt-1 max-w-[160px] truncate">{product.image_url}</span>
          </div>
        ) : (
          <img
            src={product.image_url}
            alt={product.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        )}
        {/* Dynamic Vignette / Lower Gradient Bar */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/90 pointer-events-none" />
      </div>

      {/* Bottom Overlay & Product Details (Bottom 40%) */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pt-10 z-10 flex flex-col items-center text-center text-white" id="story-bottom-panel">
        {/* Category tag */}
        {product.category && (
          <span className="mb-2 bg-white/12 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[8px] font-mono tracking-wider font-semibold border border-white/10 uppercase">
            {product.category}
          </span>
        )}

        {/* Title and stats */}
        <h3 className="text-xs font-semibold tracking-tight text-white mb-1.5 leading-snug max-w-[180px] line-clamp-2 drop-shadow-md">
          {product.title}
        </h3>

        {/* Price layout */}
        <div className="flex items-center gap-1.5 justify-center mb-4">
          <span className="text-sm font-black text-rose-400 drop-shadow-sm">
            {product.currency} {product.price.toFixed(2)}
          </span>
          {product.original_price && product.original_price > product.price && (
            <span className="text-[9px] text-gray-400 font-mono line-through">
              {product.currency} {product.original_price.toFixed(2)}
            </span>
          )}
        </div>

        {/* Call to action "Swipe Up" */}
        <div className="flex flex-col items-center justify-center pt-2 w-full animate-bounce" id="swipe-up-ticker">
          <ChevronUp className="w-4 h-4 text-white hover:text-white/80" />
          <span className="text-[9px] tracking-widest font-bold uppercase text-white/90 drop-shadow mt-0.5">
            Swipe Up to Shop
          </span>
        </div>
      </div>
    </div>
  );
}
