/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Heart, MessageCircle, Share2, Music, Bookmark, Sparkles } from "lucide-react";
import { Product, DesignRule } from "../../types/product.ts";

interface AdPreviewProps {
  product: Product;
  rules: DesignRule[];
}

export default function TikTokAd({ product, rules }: AdPreviewProps) {
  const [imgError, setImgError] = useState(false);
  const [liked, setLiked] = useState(false);
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
      id={`tiktok-ad-${product.id}`}
      style={{ width: "225px", height: "400px" }}
      className="mx-auto bg-black rounded-xl overflow-hidden relative shadow-2xl border border-gray-900 flex flex-col justify-between font-sans select-none"
    >
      {/* Top Header - TikTok Logo Watermark */}
      <div className="absolute top-3.5 left-3 z-10 flex items-center gap-1 opacity-70 pointer-events-none" id="tiktok-watermark">
        <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.63 4.18 1.13 1.2 2.7 1.94 4.34 2.11v3.9c-1.88-.04-3.7-.68-5.23-1.8-.18-.13-.35-.27-.52-.41v7.62c.04 1.94-.52 3.88-1.59 5.48-1.29 1.93-3.4 3.23-5.71 3.54-2.82.4-5.75-.43-7.91-2.31C-.13 20.3-1.04 17.06-.61 14c.33-2.35 1.61-4.5 3.54-5.84 1.83-1.29 4.1-1.92 6.36-1.76v3.91c-1.39-.14-2.83.17-3.98 1.01-.98.71-1.63 1.83-1.8 3.04-.26 1.85.58 3.73 2.1 4.75 1.35.91 3.1 1.15 4.63.63 1.22-.41 2.22-1.37 2.68-2.54.19-.51.27-1.05.27-1.6V0h-.28c.01.01.01.01 0 0z" />
        </svg>
        <span className="text-[9px] font-bold text-white tracking-widest uppercase">TikTok</span>
      </div>

      {/* Media Bleed Area */}
      <div className="absolute inset-0 z-0 bg-[#0c0c0e]" id="tiktok-bg-frame">
        {imgError || !product.image_url ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-950 text-gray-600 font-mono text-[9px] p-4 text-center">
            <Sparkles className="w-5 h-5 text-gray-800 mb-1" />
            <span>TikTok Premium Content</span>
          </div>
        ) : (
          <img
            src={product.image_url}
            alt={product.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        )}
        {/* Subtle vignette layer */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/80 pointer-events-none" />
      </div>

      {/* Right Floating Operations (TikTok UI Actions) */}
      <div className="absolute right-2 top-[120px] z-10 flex flex-col items-center gap-3.5" id="tiktok-interactions-panel">
        {/* Profile Circle */}
        <div className="relative mb-1">
          <div className="w-8 h-8 rounded-full border border-white bg-gray-800 flex items-center justify-center font-display font-black text-[9px] text-[#FE2C55]">
            {product.brand.slice(0, 2).toUpperCase()}
          </div>
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[#FE2C55] text-white flex items-center justify-center text-[8px] font-bold">
            +
          </span>
        </div>

        {/* Favorite Heart action */}
        <button
          onClick={() => setLiked(!liked)}
          className="flex flex-col items-center gap-0.5 text-center cursor-pointer"
          id={`tiktok-like-${product.id}`}
        >
          <Heart
            className={`w-6 h-6 drop-shadow-md stroke-2 ${
              liked ? "fill-[#FE2C55] stroke-[#FE2C55]" : "text-white"
            }`}
          />
          <span className="text-[8px] text-white font-mono font-medium drop-shadow-sm">
            {liked ? "48.2K" : "48.1K"}
          </span>
        </button>

        {/* Comment count */}
        <div className="flex flex-col items-center gap-0.5 text-center">
          <MessageCircle className="w-6 h-6 text-white drop-shadow-md" />
          <span className="text-[8px] text-white font-mono font-medium drop-shadow-sm">419</span>
        </div>

        {/* Bookmark */}
        <div className="flex flex-col items-center gap-0.5 text-center">
          <Bookmark className="w-6 h-6 text-white drop-shadow-md" />
          <span className="text-[8px] text-white font-mono font-medium drop-shadow-sm">2.4K</span>
        </div>

        {/* Share */}
        <div className="flex flex-col items-center gap-0.5 text-center">
          <Share2 className="w-6 h-6 text-white drop-shadow-md" strokeWidth={2.5} />
          <span className="text-[8px] text-white font-mono font-medium drop-shadow-sm">Share</span>
        </div>
      </div>

      {/* Bottom Overlay Info & White CTA banner */}
      <div className="absolute bottom-0 left-0 right-0 p-3 z-10 flex flex-col" id="tiktok-bottom-panel">
        <div className="pr-12 text-white mb-2.5 text-left">
          {/* Brand account */}
          <h4 className="text-[10px] font-bold tracking-tight mb-1 flex items-center gap-1.5">
            @{product.brand.toLowerCase().replace(/\s+/g, "")}
            <span className="bg-[#25F4EE] text-black text-[6px] font-bold px-1 py-0.2 rounded font-mono uppercase">
              Ad
            </span>
          </h4>

          {/* Description / Caption text */}
          <p className="text-[10px] text-gray-200 line-clamp-2 leading-relaxed mb-1.5 font-light">
            {product.title}. Premium catalog selection now available.
          </p>

          {/* Price tags / Animated values */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-black text-[#25F4EE] drop-shadow-sm">
              {product.currency} {product.price.toFixed(2)}
            </span>
            {product.original_price && product.original_price > product.price && (
              <span className="text-[8px] text-gray-400 font-mono line-through">
                {product.currency} {product.original_price.toFixed(2)}
              </span>
            )}
            
            {/* Rule badge pill if custom rules active */}
            {activeRule && (
              <span
                style={{ backgroundColor: activeRule.badgeColor }}
                className="px-1.5 py-0.2 rounded text-[7px] font-black text-white uppercase tracking-wider animate-pulse inline-block"
              >
                {activeRule.badge}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-[8px] text-gray-300 mt-1.5 select-none opacity-85 font-mono">
            <Music className="w-2.5 h-2.5 text-[#FE2C55] shrink-0" />
            <span className="truncate max-w-[130px]">Original Sound - {product.brand}</span>
          </div>
        </div>

        {/* TikTok White CTA Bar */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setRedirecting(true);
            setTimeout(() => setRedirecting(false), 2000);
          }}
          className="w-full bg-[#FE2C55] hover:bg-[#e0264b] text-white py-2 px-3 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors shadow-lg cursor-pointer flex items-center justify-between"
          id={`tiktok-cta-${product.id}`}
        >
          <span>{redirecting ? "Opening Catalog..." : "Shop Now"}</span>
          <span className="text-[8px] bg-black/25 px-1.5 py-0.5 rounded font-mono">
            🡥
          </span>
        </button>
      </div>
    </div>
  );
}
