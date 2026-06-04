/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from "vitest";
import { sanitizeString, escapeCSVFormula, validateProduct, parseCSVLine } from "../../server.ts";

describe("AdFeed Studio - QA Compliance & Security Guard Suite", () => {
  
  describe("CRIT-04: Input Sanitization (XSS Defense)", () => {
    it("should strip malicious HTML tags from string entries", () => {
      const malicious = "<script>alert('execute xss')</script>Vintage Bomber";
      const sanitized = sanitizeString(malicious);
      expect(sanitized).toBe("alert('execute xss')Vintage Bomber");
    });

    it("should remove iframe or nested tags completely", () => {
      const entry = "<iframe src='javascript:alert(1)'></iframe>Matte Cup";
      const sanitized = sanitizeString(entry);
      expect(sanitized).toBe("Matte Cup");
    });
  });

  describe("CRIT-03: CSV Injection (Formula Injection Vulnerability Defense)", () => {
    it("should escape leading injection trigger characters", () => {
      expect(escapeCSVFormula("=SUM(A1:A5)")).toBe("'=SUM(A1:A5)");
      expect(escapeCSVFormula("+100.00")).toBe("'+100.00");
      expect(escapeCSVFormula("-50")).toBe("'-50");
      expect(escapeCSVFormula("@active")).toBe("'@active");
    });

    it("should pass harmless standard alphanumeric strings untouched", () => {
      expect(escapeCSVFormula("Premium Leather Bomber")).toBe("Premium Leather Bomber");
      expect(escapeCSVFormula("32.50")).toBe("32.50");
    });
  });

  describe("CRIT-04: Image SSRF Protection Protocol", () => {
    it("should block loopback, local interfaces and cloud instance metadata addresses", () => {
      const blockedUrls = [
        "http://localhost/image.png",
        "http://127.0.0.1/image.png",
        "http://169.254.169.254/latest/meta-data/",
        "http://10.0.0.1/pic.jpg",
        "https://192.168.1.100/logo.png",
        "http://[::1]/image.svg"
      ];

      blockedUrls.forEach((url, idx) => {
        const rawObj = {
          id: `p-${idx}`,
          title: `Item-${idx}`,
          brand: "Brand",
          price: 15.0,
          image_url: url
        };
        const { errors } = validateProduct(rawObj, idx);
        const hasSsrfError = errors.some(e => e.field === "image_url" && e.message.includes("SSRF Protection"));
        expect(hasSsrfError).toBe(true);
      });
    });

    it("should allow legitimate public HTTP/HTTPS URLs with structural TLDs", () => {
      const rawObj = {
        id: "legit-1",
        title: "Standard Classic Bomber",
        brand: "Aero & Co",
        price: 99.00,
        image_url: "https://images.unsplash.com/photo-1551028719"
      };
      const { product, errors } = validateProduct(rawObj, 0);
      expect(errors).toHaveLength(0);
      expect(product).toBeDefined();
      expect(product?.image_url).toBe("https://images.unsplash.com/photo-1551028719");
    });
  });

  describe("HIGH-02: Boundary Conditions (Price & Discounts)", () => {
    it("should compute discount percent correctly on proper sale pricing", () => {
      const raw = {
        id: "prod-sale",
        title: "Classic Bomber",
        brand: "Aero",
        price: 150.00,
        original_price: 200.00,
        image_url: "https://images.unsplash.com/photo-123"
      };
      const { product, errors } = validateProduct(raw, 0);
      expect(errors).toHaveLength(0);
      expect(product?.discount_percent).toBe(25);
    });

    it("should fail validation if original_price is less than sale price", () => {
      const raw = {
        id: "prod-invalid",
        title: "Classic Bomber",
        brand: "Aero",
        price: 150.00,
        original_price: 100.00,
        image_url: "https://images.unsplash.com/photo-123"
      };
      const { errors } = validateProduct(raw, 0);
      const originalPriceError = errors.some(e => e.field === "original_price" && e.message.includes("Original price must be greater than or equal to sale price"));
      expect(originalPriceError).toBe(true);
    });

    it("should fail validation for sub-zero prices", () => {
      const raw = {
        id: "prod-subzero",
        title: "Classic Bomber",
        brand: "Aero",
        price: -10.00,
        image_url: "https://images.unsplash.com/photo-123"
      };
      const { errors } = validateProduct(raw, 0);
      const priceError = errors.some(e => e.field === "price" && e.message.includes("Price must be a positive number"));
      expect(priceError).toBe(true);
    });
  });
});
