/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  title: string;
  brand: string;
  price: number;
  original_price?: number;
  currency: string;
  image_url: string;
  category?: string;
  discount_percent?: number;
  in_stock: boolean;
}

export interface FeedValidationError {
  product_id?: string;
  field: string;
  message: string;
}

export interface FeedParseResponse {
  products: Product[];
  errors: FeedValidationError[];
  total: number;
  valid_count: number;
}

export type Platform = "meta-feed" | "meta-story" | "tiktok" | "google-shopping";

export interface DesignRule {
  id: string;
  condition: "discount_gt" | "out_of_stock" | "always";
  threshold?: number; // threshold percent (e.g. 20 for 20%)
  badge: "SALE" | "OUT OF STOCK" | "NEW" | "HOT";
  badgeColor: string; // e.g. "#FF4D00", "#000000", etc.
}
