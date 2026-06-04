/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Star, ShieldAlert, BadgeCheck, Sparkles } from "lucide-react";
import { Product, DesignRule } from "../../types/product.ts";

interface AdPreviewProps {
  product: Product;
  rules: DesignRule[];
}

export default function GoogleAd({ product, rules }: AdPreviewProps) {
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
      id={`google-shopping-${product.id}`}
      style={{ minHeight: "160px" }}
      className="w-full max-w-md mx-auto bg-[#18191a] border border-gray-800 rounded-lg overflow-hidden shadow-xl flex font-sans"
    >
      {/* Left 40%: Product Image Square */}
      <div className="w-[40%] shrink-0 bg-[#1c1c1e] relative border-r border-gray-800/80" id="google-image-box">
        {imgError || !product.image_url ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-950 p-2 text-center text-gray-600 font-mono text-[9px]">
            <Sparkles className="w-5 h-5 text-gray-800 mb-1" />
            <span>Not Available</span>
          </div>
        ) : (
          <img
            src={product.image_url}
            alt={product.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-opacity duration-300"
          />
        )}

        {/* Dynamic Badge sticker from custom parameters */}
        {activeRule && (
          <div
            style={{ backgroundColor: activeRule.badgeColor }}
            className="absolute top-2 left-2 px-2 py-0.5 rounded text-[8px] font-black text-white tracking-wider uppercase shadow shadow-black/40 z-10"
          >
            {activeRule.badge}
          </div>
        )}
      </div>

      {/* Right 60%: Google Structured Product Info */}
      <div className="w-[60%] p-3.5 flex flex-col justify-between" id="google-info-frame">
        <div id="google-main-details">
          {/* Tag & Category header */}
          <div className="flex items-center justify-between gap-1 mb-1" id="google-sub-header">
            <span className="text-[9px] text-[#34A853] font-mono uppercase tracking-widest font-semibold">
              {product.category || "Google Store"}
            </span>
            <span className="text-[8px] text-gray-500 font-medium">Ads · Google Product Search</span>
          </div>

          {/* Title */}
          <h3 className="text-xs font-semibold text-gray-100 leading-snug line-clamp-2 mb-1">
            {product.title}
          </h3>

          {/* Manufacturer / Seller brand name */}
          <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1 mb-1.5">
            <span>By {product.brand}</span>
            <span className="inline-flex text-[#34A853]">
              <BadgeCheck className="w-3 h-3 fill-current text-[#34A853]" />
            </span>
          </p>

          {/* Star review layout - Static 4.5 stars */}
          <div className="flex items-center gap-1 text-gray-400 text-[10px] mb-2" id="google-ratings">
            <div className="flex text-amber-500">
              <Star className="w-3 h-3 fill-current" />
              <Star className="w-3 h-3 fill-current" />
              <Star className="w-3 h-3 fill-current" />
              <Star className="w-3 h-3 fill-current" />
              <Star className="w-3 h-3 fill-current opacity-40" />
            </div>
            <span className="font-mono text-gray-300">4.5 (82)</span>
          </div>
        </div>

        {/* Footer info: Google green prices and free shipping */}
        <div className="pt-2 border-t border-gray-800/60 flex items-end justify-between" id="google-footer-pricing">
          <div className="flex flex-col">
            {/* Price values */}
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-sm font-black text-[#34A853] tracking-tight">
                {product.currency} {product.price.toFixed(2)}
              </span>
              {product.original_price && product.original_price > product.price && (
                <span className="text-[9px] text-gray-500 font-mono line-through">
                  {product.original_price.toFixed(2)}
                </span>
              )}
            </div>

            {/* Savings percentage if applicable */}
            {product.discount_percent && product.discount_percent > 0 ? (
              <span className="text-[9px] font-semibold text-[#34A853] mt-0.5 font-mono">
                Save {product.discount_percent}% today
              </span>
            ) : null}
          </div>

          {/* Shipping badge/logo watermark */}
          <div className="text-right flex flex-col items-end gap-1" id="google-shipping">
            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold font-mono tracking-wide ${
              product.price > 50 
                ? "bg-emerald-950 text-emerald-400 border border-emerald-900/60" 
                : "bg-gray-900 text-gray-400"
            }`}>
              {product.price > 50 ? "FREE SHIPPING" : "STANDARD SHIP"}
            </span>
            <span className="text-[8px] text-gray-500 font-bold tracking-tight uppercase select-none">
              Google Shopping
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
