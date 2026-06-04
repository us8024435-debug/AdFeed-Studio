/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Sparkles, MessageCircle, Share2, ThumbsUp } from "lucide-react";
import { Product, DesignRule } from "../../types/product.ts";

interface AdPreviewProps {
  product: Product;
  rules: DesignRule[];
}

export default function MetaFeedAd({ product, rules }: AdPreviewProps) {
  const [imgError, setImgError] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

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
      id={`meta-feed-${product.id}`}
      className="w-full max-w-sm mx-auto bg-[#18191a] border border-gray-800 rounded-lg overflow-hidden shadow-2xl flex flex-col font-sans"
    >
      {/* Mock Facebook Header */}
      <div className="p-3.5 flex items-center gap-2.5 border-b border-gray-850 bg-[#242526]" id="meta-header">
        <div className="w-9 h-9 rounded-full bg-[#1877F2]/10 flex items-center justify-center font-display font-black text-xs text-[#1877F2] border border-[#1877F2]/25">
          {product.brand.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-100 flex items-center gap-1">
            {product.brand}
            <span className="w-3 h-3 bg-[#1877F2] rounded-full inline-flex items-center justify-center text-white text-[7px]">✓</span>
          </h4>
          <span className="text-[11px] text-gray-400 block leading-none mt-0.5">Sponsored · Paid Catalog</span>
        </div>
      </div>

      {/* Main Container - 1:1 Visual Aspect */}
      <div className="relative w-full aspect-square bg-[#1c1c1e] overflow-hidden" id="meta-media-frame">
        {imgError || !product.image_url ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 border-b border-gray-800 text-gray-500 font-mono text-xs p-4 text-center">
            <span className="text-[#FF4D00] text-3xl mb-1 mt-2">✦</span>
            <span>Image Unavailable</span>
            <span className="text-[10px] text-gray-600 mt-1 max-w-[200px] truncate">{product.image_url}</span>
          </div>
        ) : (
          <img
            src={product.image_url}
            alt={product.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        )}

        {/* Dynamic Badge Overrides from rules */}
        {activeRule && (
          <div
            id={`meta-badge-${product.id}`}
            style={{ backgroundColor: activeRule.badgeColor }}
            className="absolute top-3.5 right-3.5 px-3 py-1 rounded text-[10px] font-bold text-white tracking-wider uppercase shadow shadow-black/50 z-10"
          >
            {activeRule.badge}
          </div>
        )}

        {/* Brand visual tag top-left */}
        <div className="absolute top-3.5 left-3.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[9px] font-mono font-medium tracking-tight text-white border border-white/10">
          {product.category || "Catalog"}
        </div>
      </div>

      {/* Product Specs Bar & Shop controls (Bottom 30%) */}
      <div className="p-4 flex flex-col bg-[#242526] border-t border-gray-850" id="meta-detail-row">
        <div className="flex justify-between items-start gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-cyan-400 font-mono font-semibold uppercase tracking-wider mb-0.5">
              {product.brand}
            </p>
            <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2">
              {product.title}
            </h3>
          </div>
          
          <div className="text-right shrink-0">
            <div className="text-base font-bold text-white">
              {product.currency} {product.price.toFixed(2)}
            </div>
            {product.original_price && product.original_price > product.price && (
              <div className="text-[11px] text-gray-400 font-mono line-through mt-0.5">
                {product.currency} {product.original_price.toFixed(2)}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions and Shop CTA */}
        <div className="flex items-center justify-between border-t border-gray-800/60 pt-3 mt-1.5">
          <span className="text-[10px] text-gray-500 font-mono italic">
            meta.com/ads/feed
          </span>
          <button
            id={`meta-cta-${product.id}`}
            onClick={(e) => {
              e.preventDefault();
              setRedirecting(true);
              setTimeout(() => setRedirecting(false), 2000);
            }}
            className="px-4 py-2 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded font-semibold text-[11px] tracking-wide uppercase transition-colors shadow border border-[#1877F2] cursor-pointer min-w-[90px]"
          >
            {redirecting ? "Opening..." : "Shop Now"}
          </button>
        </div>
      </div>

      {/* Meta feed interaction row */}
      <div className="px-3 py-2 bg-[#18191a] border-t border-gray-850 flex items-center justify-around text-gray-400 text-xs text-center font-medium">
        <button className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer py-1">
          <ThumbsUp className="w-3.5 h-3.5" /> Like
        </button>
        <button className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer py-1">
          <MessageCircle className="w-3.5 h-3.5" /> Comment
        </button>
        <button className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer py-1">
          <Share2 className="w-3.5 h-3.5" /> Share
        </button>
      </div>
    </div>
  );
}
