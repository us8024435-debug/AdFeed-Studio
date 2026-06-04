/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Product, FeedValidationError, FeedParseResponse } from "./src/types/product.ts";

// Helper: Strip HTML tags to prevent custom cross-site scripting (XSS)
export function sanitizeString(val: string): string {
  return val.replace(/<[^>]*>/g, "").trim();
}

// Helper: Escape formula strings to mitigate CSV injection vulnerability
export function escapeCSVFormula(val: string): string {
  if (val.startsWith("=") || val.startsWith("+") || val.startsWith("-") || val.startsWith("@")) {
    return `'${val}`;
  }
  return val;
}

// Validation helper replicating Pydantic strictness in TypeScript
export function validateProduct(raw: any, index: number): { product?: Product; errors: FeedValidationError[] } {
  const errors: FeedValidationError[] = [];
  
  // ID validation
  const idVal = raw.id !== undefined && raw.id !== null ? sanitizeString(String(raw.id)) : "";
  const product_id = idVal || `Row-${index + 1}`;
  if (!idVal) {
    errors.push({ product_id, field: "id", message: "ID is required." });
  }

  // Title validation (max 150 characters)
  const titleVal = raw.title !== undefined && raw.title !== null ? sanitizeString(String(raw.title)) : "";
  if (!titleVal) {
    errors.push({ product_id, field: "title", message: "Title is required." });
  } else if (titleVal.length > 150) {
    errors.push({ product_id, field: "title", message: "Title exceeds maximum length of 150 characters." });
  }

  // Brand validation
  const brandVal = raw.brand !== undefined && raw.brand !== null ? sanitizeString(String(raw.brand)) : "";
  if (!brandVal) {
    errors.push({ product_id, field: "brand", message: "Brand is required." });
  }

  // Price validation (must be positive number)
  let priceVal = NaN;
  if (raw.price !== undefined && raw.price !== null && String(raw.price).trim() !== "") {
    // Strip dollar signs, commas, or currency letters while preserving negative sign
    const rawPrice = String(raw.price).replace(/[^0-9.-]/g, "");
    priceVal = parseFloat(rawPrice);
  }
  if (isNaN(priceVal)) {
    errors.push({ product_id, field: "price", message: "Price is required and must be a valid number." });
  } else if (priceVal <= 0) {
    errors.push({ product_id, field: "price", message: "Price must be a positive number." });
  }

  // Original price validation (optional, must be >= price)
  let origPriceVal: number | undefined = undefined;
  if (raw.original_price !== undefined && raw.original_price !== null && String(raw.original_price).trim() !== "") {
    const rawOrig = String(raw.original_price).replace(/[^0-9.-]/g, "");
    origPriceVal = parseFloat(rawOrig);
    if (isNaN(origPriceVal)) {
      errors.push({ product_id, field: "original_price", message: "Original price must be a valid number." });
    } else if (origPriceVal < priceVal) {
      errors.push({ product_id, field: "original_price", message: "Original price must be greater than or equal to sale price." });
    } else if (origPriceVal <= 0) {
      errors.push({ product_id, field: "original_price", message: "Original price must be a positive number." });
    }
  }

  // Currency validation (default "USD", 3-letter uppercase)
  let currencyVal = "USD";
  if (raw.currency !== undefined && raw.currency !== null && String(raw.currency).trim() !== "") {
    currencyVal = sanitizeString(String(raw.currency)).toUpperCase();
  }
  if (currencyVal.length !== 3) {
    errors.push({ product_id, field: "currency", message: "Currency must be a 3-letter currency code (e.g., USD)." });
  }

  // Image URL validation with SSRF and Protocol guards
  const imageUrlVal = raw.image_url !== undefined && raw.image_url !== null ? String(raw.image_url).trim() : "";
  if (!imageUrlVal) {
    errors.push({ product_id, field: "image_url", message: "Image URL is required." });
  } else {
    try {
      const url = new URL(imageUrlVal);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        errors.push({ product_id, field: "image_url", message: "Image URL must use http or https protocol." });
      } else {
        const hostname = url.hostname.toLowerCase();
        // Strict SSRF controls
        if (
          hostname === "localhost" ||
          hostname === "127.0.0.1" ||
          hostname === "[::1]" ||
          hostname === "169.254.169.254" ||
          hostname.startsWith("10.") ||
          hostname.startsWith("192.168.") ||
          /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname) ||
          !hostname.includes(".") // prevents access to internal endpoints (e.g. metadata-server)
        ) {
          errors.push({ product_id, field: "image_url", message: "SSRF Protection: Blocked reference to internal IP range or local host." });
        }
      }
    } catch {
      errors.push({ product_id, field: "image_url", message: "Image URL must be a valid formatted URL." });
    }
  }

  // Category (optional)
  const categoryVal = raw.category !== undefined && raw.category !== null && String(raw.category).trim() !== "" 
    ? sanitizeString(String(raw.category)) 
    : undefined;

  // In Stock (boolean, default true)
  let inStockVal = true;
  if (raw.in_stock !== undefined && raw.in_stock !== null) {
    const s = String(raw.in_stock).toLowerCase().trim();
    if (s === "false" || s === "0" || s === "no" || s === "out of stock" || s === "outofstock" || s === "out_of_stock") {
      inStockVal = false;
    }
  }

  // Dynamic discount_percent computation
  let discountPercentVal: number | undefined = undefined;
  if (origPriceVal !== undefined && origPriceVal > priceVal && origPriceVal > 0) {
    discountPercentVal = Math.round(((origPriceVal - priceVal) / origPriceVal) * 100);
  }

  if (errors.length > 0) {
    return { errors };
  }

  const validatedProduct: Product = {
    id: idVal,
    title: titleVal,
    brand: brandVal,
    price: priceVal,
    original_price: origPriceVal,
    currency: currencyVal,
    image_url: imageUrlVal,
    category: categoryVal,
    discount_percent: discountPercentVal,
    in_stock: inStockVal
  };

  return { product: validatedProduct, errors: [] };
}

// Custom simple quote-aware CSV line parsing
export function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip next escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(escapeCSVFormula(current));
      current = "";
    } else {
      current += char;
    }
  }
  result.push(escapeCSVFormula(current));
  return result;
}

// Maps different potential feed headers to standard schema fields
export function mapHeaders(headers: string[]): Record<string, number> {
  const mapping: Record<string, number> = {};
  headers.forEach((hdr, idx) => {
    const norm = hdr.toLowerCase().trim().replace(/^g:/, ""); // handles google namespace (e.g. g:id, g:image_link)
    
    if (norm === "id" || norm === "sku" || norm === "productid" || norm === "item_id") {
      mapping["id"] = idx;
    } else if (norm === "title" || norm === "name" || norm === "productname") {
      mapping["title"] = idx;
    } else if (norm === "brand" || norm === "manufacturer" || norm === "vendor") {
      mapping["brand"] = idx;
    } else if (norm === "price" || norm === "sale_price" || norm === "saleprice") {
      mapping["price"] = idx;
    } else if (norm === "original_price" || norm === "compare_at_price" || norm === "list_price" || norm === "regular_price" || norm === "price_original") {
      mapping["original_price"] = idx;
    } else if (norm === "currency" || norm === "price_currency") {
      mapping["currency"] = idx;
    } else if (norm === "image_url" || norm === "image_link" || norm === "image" || norm === "img" || norm === "imageUrl") {
      mapping["image_url"] = idx;
    } else if (norm === "category" || norm === "product_type" || norm === "type" || norm === "google_product_category") {
      mapping["category"] = idx;
    } else if (norm === "in_stock" || norm === "availability" || norm === "instock") {
      mapping["in_stock"] = idx;
    }
  });

  // Fallbacks by exact matching headers if some crucial properties are still unmapped
  if (mapping["id"] === undefined) mapping["id"] = headers.findIndex(h => /id/i.test(h));
  if (mapping["title"] === undefined) mapping["title"] = headers.findIndex(h => /title|name/i.test(h));
  if (mapping["brand"] === undefined) mapping["brand"] = headers.findIndex(h => /brand/i.test(h));
  if (mapping["price"] === undefined) mapping["price"] = headers.findIndex(h => /price/i.test(h) && !/original|compare|list/i.test(h));
  if (mapping["image_url"] === undefined) mapping["image_url"] = headers.findIndex(h => /image|img/i.test(h));

  return mapping;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // In-memory rate limiter to prevent flooding
  const rateLimits: Record<string, { count: number; resetTime: number }> = {};
  function rateLimiter(req: express.Request, res: express.Response, next: express.NextFunction) {
    const ip = String(req.ip || req.headers["x-forwarded-for"] || "unknown-ip");
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 mins
    const maxLimit = 100;

    if (!rateLimits[ip] || rateLimits[ip].resetTime < now) {
      rateLimits[ip] = { count: 1, resetTime: now + windowMs };
      return next();
    }

    rateLimits[ip].count++;
    if (rateLimits[ip].count > maxLimit) {
      res.status(429).json({
        error: `Too many requests. Rate limit exceeded (Max ${maxLimit} requests per 15 minutes).`
      });
      return;
    }
    next();
  }

  // Security Auth middleware (optional, activated if env ADFEED_API_KEY is defined)
  function apiKeyAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
    const serverKey = process.env.ADFEED_API_KEY;
    if (!serverKey) {
      return next(); // Skip if not set in environment
    }
    const clientKey = req.headers["x-adfeed-api-key"] || req.query.apiKey;
    if (clientKey !== serverKey) {
      res.status(401).json({ error: "Unauthorized: Invalid or missing API Key." });
      return;
    }
    next();
  }

  // Body parsers
  app.use(express.json({ limit: "5mb" }));
  app.use(express.urlencoded({ extended: true, limit: "5mb" }));

  // CORS Middleware
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-AdFeed-API-Key");
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // Apply rate limiter and optional API auth to feed parsing endpoints
  app.use("/api/feed/", rateLimiter, apiKeyAuth);

  // GET /api/feed/sample
  app.get("/api/feed/sample", (req, res) => {
    const sampleProducts: Product[] = [
      {
        id: "jacket-001",
        title: "Heritage Soft Leather Bomber Jacket - Vintage Amber",
        brand: "Aero & Co. New York",
        price: 149.00,
        original_price: 220.00,
        currency: "USD",
        image_url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80",
        category: "Apparel",
        discount_percent: 32,
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
      },
      {
        id: "head-990",
        title: "Acoustics SoundPro X Over-Ear ANC Headphones",
        brand: "SoundPro Audio",
        price: 189.00,
        original_price: 289.00,
        currency: "USD",
        image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
        category: "Electronics",
        discount_percent: 35,
        in_stock: false
      }
    ];
    res.json({ products: sampleProducts });
  });

  // POST /api/feed/parse
  app.post("/api/feed/parse", (req, res) => {
    let rawItems: any[] = [];
    if (Array.isArray(req.body)) {
      rawItems = req.body;
    } else if (req.body && Array.isArray(req.body.products)) {
      rawItems = req.body.products;
    } else {
      res.status(400).json({ error: "Invalid layout. Must provide an array of products." });
      return;
    }

    // CRIT-02 & TC-014 Enforce maximum load capacity of 1000 items
    if (rawItems.length > 1000) {
      res.status(400).json({ error: "Too many products. Mass parsed payload capacity is 1000 items maximum." });
      return;
    }

    const products: Product[] = [];
    const errors: FeedValidationError[] = [];

    rawItems.forEach((raw, index) => {
      const { product, errors: itemErrors } = validateProduct(raw, index);
      if (itemErrors.length > 0) {
        errors.push(...itemErrors);
      } else if (product) {
        products.push(product);
      }
    });

    const response: FeedParseResponse = {
      products,
      errors,
      total: rawItems.length,
      valid_count: products.length
    };

    res.json(response);
  });

  // POST /api/feed/parse-csv
  app.post("/api/feed/parse-csv", (req, res) => {
    let csvText = "";

    if (req.body && typeof req.body.csvText === "string") {
      csvText = req.body.csvText;
    } else if (typeof req.body === "string") {
      csvText = req.body;
    } else {
      res.status(400).json({ error: "CSV text not provided in JSON or body text" });
      return;
    }

    // CRIT-03 BOM character scrubbing
    if (csvText.startsWith("\ufeff")) {
      csvText = csvText.slice(1);
    }

    // Split text into individual lines safely
    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) {
      res.status(400).json({ error: "Empty CSV or missing headers/rows" });
      return;
    }

    // CRIT-03 Enforce maximum row limit (max 1000 items)
    if (lines.length > 1001) {
      res.status(400).json({ error: "CSV file matches too many records. Maximum row capacity is 1000 lines." });
      return;
    }

    const rawHeaders = parseCSVLine(lines[0]);
    const mappings = mapHeaders(rawHeaders);

    const products: Product[] = [];
    const errors: FeedValidationError[] = [];
    let totalParsedCount = 0;

    for (let i = 1; i < lines.length; i++) {
      totalParsedCount++;
      const cols = parseCSVLine(lines[i]);
      if (cols.length === 1 && cols[0].trim() === "") continue; // skip empty lines safely

      // Build key value object from schemas mapped
      const rowObj: Record<string, any> = {};
      Object.keys(mappings).forEach(field => {
        const index = mappings[field];
        if (index !== undefined && index >= 0 && index < cols.length) {
          rowObj[field] = cols[index].trim();
        }
      });

      const { product, errors: itemErrors } = validateProduct(rowObj, i - 1);
      if (itemErrors.length > 0) {
        errors.push(...itemErrors);
      } else if (product) {
        products.push(product);
      }
    }

    const response: FeedParseResponse = {
      products,
      errors,
      total: totalParsedCount,
      valid_count: products.length
    };

    res.json(response);
  });

  // GET / health check status
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "AdFeed Studio backend running" });
  });

  // Vite middleware for development (or direct asset server in production)
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Verification of PORT parameter configuration in Phase 1
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AdFeed Studio] Server successfully running at http://0.0.0.0:${PORT}`);
  });
}

// Check if running directly in node and not in test import
if (process.env.NODE_ENV !== "test") {
  startServer().catch(err => {
    console.error("Failed to start AdFeed Studio backend server:", err);
  });
}
