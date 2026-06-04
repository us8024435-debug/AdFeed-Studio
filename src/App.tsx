/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Flame, Monitor, Layers, AlertCircle, CircleAlert, Sparkles, CheckCircle } from "lucide-react";
import FeedInput from "./components/FeedInput/index.tsx";
import PlatformSwitcher from "./components/PlatformSwitcher/index.tsx";
import DesignRules from "./components/DesignRules/index.tsx";
import MetaFeedAd from "./components/AdPreview/MetaFeedAd.tsx";
import MetaStoryAd from "./components/AdPreview/MetaStoryAd.tsx";
import TikTokAd from "./components/AdPreview/TikTokAd.tsx";
import GoogleAd from "./components/AdPreview/GoogleAd.tsx";
import EmptyState from "./components/EmptyState.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";
import LoadingSpinner from "./components/LoadingSpinner.tsx";
import { useFeedParser } from "./hooks/useFeedParser.ts";
import { Platform, DesignRule } from "./types/product.ts";

export default function App() {
  const {
    products,
    errors,
    loading,
    apiError,
    parseFeedJson,
    parseFeedCsv,
    loadSampleFeed,
    clearFeed,
  } = useFeedParser();

  const [activePlatform, setActivePlatform] = useState<Platform>("meta-feed");

  // Pre-load default rules:
  // 1. If discount > 20% -> show SALE (red / orange #FF4D00)
  // 2. If out of stock -> show OUT OF STOCK (black #000000)
  const [rules, setRules] = useState<DesignRule[]>([
    {
      id: "rule-default-1",
      condition: "discount_gt",
      threshold: 20,
      badge: "SALE",
      badgeColor: "#FF4D00",
    },
    {
      id: "rule-default-2",
      condition: "out_of_stock",
      badge: "OUT OF STOCK",
      badgeColor: "#000000",
    },
  ]);

  const handlePlatformChange = (p: Platform) => {
    setActivePlatform(p);
  };

  // Limit preview list size to first 6 items for performance (per specification)
  const maxToDisplay = 6;
  const displayedProducts = products.slice(0, maxToDisplay);
  const remainingCount = products.length > maxToDisplay ? products.length - maxToDisplay : 0;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#0A0A0B] text-gray-100 flex flex-col font-sans" id="adfeed-app-root">
        {/* Main Workspace Frame */}
        <div className="flex-1 flex flex-col lg:flex-row" id="workspace-layout">
          {/* LEFT COLUMN: Controls & Input Rail (35% width on desktop) */}
          <aside className="w-full lg:w-[35%] xl:w-[30%] bg-[#0F0F11]/95 border-b lg:border-b-0 lg:border-r border-gray-800/70 p-5 lg:p-6 overflow-y-auto flex flex-col justify-between shrink-0" id="aside-controls">
            <div className="space-y-6">
              {/* App branding */}
              <div className="flex items-center gap-2.5" id="brand-headline">
                <div className="w-9 h-9 rounded-lg bg-[#FF4D00]/10 border border-[#FF4D00]/25 flex items-center justify-center text-[#FF4D00]">
                  <Flame className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h1 className="text-xl font-display font-extrabold text-white tracking-tight flex items-baseline gap-1 bg-gradient-to-r from-white to-gray-300 bg-clip-text">
                    AdFeed Studio
                  </h1>
                  <p className="text-[10px] uppercase font-mono font-bold tracking-widest text-gray-500">
                    Confect Catalog previewer
                  </p>
                </div>
              </div>

              {/* Description Tag */}
              <div className="p-3 bg-[#141416]/60 border border-gray-850 rounded-lg" id="app-tagline-bubble">
                <p className="text-xs text-gray-400 leading-relaxed">
                  Parse raw commerce inventory feeds in seconds. Live-render compliant standard campaign graphics across <strong>Facebook</strong>, <strong>Instagram</strong>, <strong>TikTok</strong>, and <strong>Google Shopping</strong> networks in real time.
                </p>
              </div>

              {/* Feed Parser Input Component */}
              <FeedInput
                onParseJson={parseFeedJson}
                onParseCsv={parseFeedCsv}
                onLoadSample={loadSampleFeed}
                onClear={clearFeed}
                productsCount={products.length}
                loading={loading}
                errors={errors}
                apiError={apiError}
              />

              {/* Conditional Badges Styling rules builder */}
              <DesignRules rules={rules} onChange={setRules} />
            </div>

            {/* Platform Credits info footer */}
            <div className="pt-6 mt-6 border-t border-gray-800/40 text-left" id="aside-footer-credits">
              <span className="text-[10px] font-mono text-gray-500 block">
                Production-Ready Monorepo Build V1.1
              </span>
              <span className="text-[10px] text-gray-500 mt-0.5 block leading-relaxed">
                Powered by a fast express compilation parser and react template overlays. Inspired by the Confect.io domain.
              </span>
            </div>
          </aside>

          {/* RIGHT COLUMN: Visual Ad Previews Stage (65% width) */}
          <main className="flex-1 bg-[#070708] p-5 lg:p-8 overflow-y-auto flex flex-col gap-6" id="preview-stage-panel">
            {/* Platform Selection Hub */}
            <PlatformSwitcher
              activePlatform={activePlatform}
              onChange={handlePlatformChange}
              productCount={products.length}
            />

            {/* Display Stage Frame */}
            <div className="flex-1 flex flex-col" id="preview-display">
              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 py-24" id="stage-loading">
                  <LoadingSpinner size="lg" />
                  <span className="text-xs font-mono text-[#FF4D00] mt-4 uppercase tracking-widest animate-pulse">
                    Parsing catalog inventory details...
                  </span>
                </div>
              ) : products.length === 0 ? (
                <div className="my-auto" id="stage-empty">
                  <EmptyState onLoadSample={loadSampleFeed} loading={loading} />
                </div>
              ) : (
                <div className="space-y-6" id="stage-cards-grid">
                  {/* Dynamic grid depending on alignment orientations */}
                  <div
                    id="grid-renderer animate-fadeIn"
                    className={`grid gap-6 justify-center ${
                      activePlatform === "meta-feed" || activePlatform === "google-shopping"
                        ? "grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto"
                        : "grid-cols-2 sm:grid-cols-3 max-w-3xl mx-auto"
                    }`}
                  >
                    {displayedProducts.map((product) => {
                      return (
                        <div
                          key={product.id}
                          className="animate-fadeIn"
                          style={{
                            animationDelay: `${displayedProducts.indexOf(product) * 60}ms`,
                          }}
                        >
                          {activePlatform === "meta-feed" && (
                            <MetaFeedAd product={product} rules={rules} />
                          )}
                          {activePlatform === "meta-story" && (
                            <MetaStoryAd product={product} rules={rules} />
                          )}
                          {activePlatform === "tiktok" && (
                            <TikTokAd product={product} rules={rules} />
                          )}
                          {activePlatform === "google-shopping" && (
                            <GoogleAd product={product} rules={rules} />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Overflows indicator if items exceed max count criteria */}
                  {remainingCount > 0 && (
                    <div
                      id="grid-overflow-card"
                      className="text-center p-5 bg-[#141416]/40 border border-gray-800 rounded-lg max-w-md mx-auto"
                    >
                      <span className="text-xs text-gray-400 font-mono">
                        And <strong className="text-[#FF4D00]">{remainingCount}</strong> more items parsed, hidden for focus layout...
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}
