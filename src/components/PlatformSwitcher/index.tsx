/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Smartphone, LayoutGrid, Award, Radio } from "lucide-react";
import { Platform } from "../../types/product.ts";

interface PlatformSwitcherProps {
  activePlatform: Platform;
  onChange: (platform: Platform) => void;
  productCount: number;
}

export default function PlatformSwitcher({
  activePlatform,
  onChange,
  productCount,
}: PlatformSwitcherProps) {
  const platforms = [
    {
      id: "meta-feed" as Platform,
      name: "Meta Feed",
      format: "1:1 Square",
      reach: "3.2B monthly active users",
      colorClass: "hover:text-[#1877F2]",
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      id: "meta-story" as Platform,
      name: "Meta Story",
      format: "9:16 Vertical",
      reach: "500M daily story viewers",
      colorClass: "hover:text-fuchsia-400",
      icon: <Smartphone className="w-4 h-4" />,
    },
    {
      id: "tiktok" as Platform,
      name: "TikTok Ad",
      format: "9:16 Vertical",
      reach: "1.0B monthly active users",
      colorClass: "hover:text-[#FE2C55]",
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.63 4.18 1.13 1.2 2.7 1.94 4.34 2.11v3.9c-1.88-.04-3.7-.68-5.23-1.8-.18-.13-.35-.27-.52-.41v7.62c.04 1.94-.52 3.88-1.59 5.48-1.29 1.93-3.4 3.23-5.71 3.54-2.82.4-5.75-.43-7.91-2.31C-.13 20.3-1.04 17.06-.61 14c.33-2.35 1.61-4.5 3.54-5.84 1.83-1.29 4.1-1.92 6.36-1.76v3.91c-1.39-.14-2.83.17-3.98 1.01-.98.71-1.63 1.83-1.8 3.04-.26 1.85.58 3.73 2.1 4.75 1.35.91 3.1 1.15 4.63.63 1.22-.41 2.22-1.37 2.68-2.54.19-.51.27-1.05.27-1.6V0h-.28c.01.01.01.01 0 0z" />
        </svg>
      ),
    },
    {
      id: "google-shopping" as Platform,
      name: "Google Shop",
      format: "Horizontal Card",
      reach: "8.5B daily search results",
      colorClass: "hover:text-[#34A853]",
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.113-5.136 4.113-3.072 0-5.561-2.488-5.561-5.56s2.489-5.56 5.56-5.56c1.395 0 2.668.512 3.649 1.355l3.155-3.155C18.87 1.8 15.795 1 12.24 1c-6.19 0-11.2 5.01-11.2 11.2s5.01 11.21 11.2 11.21c5.966 0 10.87-4.223 11.2-10.125l-.26-.135h-10.94z" />
        </svg>
      ),
    },
  ];

  const activeInfo = platforms.find((p) => p.id === activePlatform) || platforms[0];

  return (
    <div className="bg-[#141416]/90 backdrop-blur-md border border-gray-800 rounded-xl p-4 shadow-xl text-left" id="platform-switcher-container">
      {/* Upper Tab Bar */}
      <div className="flex border-b border-gray-800 overflow-x-auto gap-1 scrollbar-none pb-1" id="switcher-tabs">
        {platforms.map((platform) => {
          const isActive = platform.id === activePlatform;
          return (
            <button
              key={platform.id}
              id={`switch-to-${platform.id}`}
              onClick={() => onChange(platform.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-[#1C1C1E] text-white border-b-2 border-[#FF4D00]"
                  : "text-gray-400 " + platform.colorClass
              }`}
            >
              {platform.icon}
              <span>{platform.name}</span>
            </button>
          );
        })}
      </div>

      {/* Sub-Header metadata indicators */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mt-3 pt-1 text-xs" id="switcher-specs">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-gray-300 font-mono">
            <LayoutGrid className="w-3.5 h-3.5 text-[#FF4D00]" />
            Format Aspect: <strong className="text-white bg-gray-800 px-1.5 py-0.5 rounded text-[10px]">{activeInfo.format}</strong>
          </span>
          <span className="flex items-center gap-1.5 text-gray-305 text-gray-300 font-mono">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            Ad Impact: <span className="text-gray-400 italic text-[11px]">{activeInfo.reach}</span>
          </span>
        </div>

        <div className="text-[11px] text-gray-400 font-mono sm:text-right" id="product-stats-text">
          Displaying <span className="text-[#FF4D00] font-bold">{Math.min(productCount, 6)}</span> of{" "}
          <span className="text-white font-bold">{productCount}</span> items parsed.
        </div>
      </div>
    </div>
  );
}
