/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { Product, FeedValidationError, FeedParseResponse } from "../types/product.ts";

// Helper fetch helper with timeout and fetch retry mechanisms
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 3,
  timeoutMs = 10000
): Promise<Response> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(id);
      return response;
    } catch (err: any) {
      clearTimeout(id);
      
      const isAbort = err.name === "AbortError";
      const isLastAttempt = attempt === retries;

      if (isAbort) {
        if (isLastAttempt) {
          throw new Error(`Request timed out after ${timeoutMs / 1000}s`);
        }
      } else {
        if (isLastAttempt) {
          throw err;
        }
      }
      
      // Short exponential backoff before retrying
      await new Promise(resolve => setTimeout(resolve, attempt * 400));
    }
  }
  throw new Error("Fetch failed after retries");
}

export function useFeedParser() {
  const [products, setProducts] = useState<Product[]>([]);
  const [errors, setErrors] = useState<FeedValidationError[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Keep track of any active requests to abort on unmount
  const activeControllers = useRef<AbortController[]>([]);

  useEffect(() => {
    return () => {
      // Abort all pending queries on cleanup
      activeControllers.current.forEach(c => c.abort());
    };
  }, []);

  const getApiUrl = useCallback((path: string): string => {
    const baseUrl = ((import.meta as any).env?.VITE_API_URL || "").trim();
    // Normalize path slash
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    if (baseUrl) {
      return `${baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl}${cleanPath}`;
    }
    return cleanPath;
  }, []);

  const parseFeedJson = useCallback(async (jsonString: string): Promise<boolean> => {
    setLoading(true);
    setApiError(null);
    setErrors([]);

    try {
      // Basic precheck of client JSON
      let parsedData: any;
      try {
        parsedData = JSON.parse(jsonString);
      } catch (e: any) {
        setApiError(`Invalid JSON format: ${e.message}`);
        setLoading(false);
        return false;
      }

      const res = await fetchWithRetry(getApiUrl("/api/feed/parse"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsedData),
      });

      if (!res.ok) {
        throw new Error(`API Error: ${res.statusText} (${res.status})`);
      }

      const data: FeedParseResponse = await res.json();
      setProducts(data.products || []);
      setErrors(data.errors || []);
      
      if (data.products.length === 0 && data.errors.length > 0) {
        setApiError("Feed parsed, but 0 products were valid. See alignment issues below.");
      }
      return true;
    } catch (err: any) {
      setApiError(err.message || "An unexpected error occurred while parsing JSON.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [getApiUrl]);

  const parseFeedCsv = useCallback(async (file: File): Promise<boolean> => {
    setLoading(true);
    setApiError(null);
    setErrors([]);

    try {
      const csvText = await file.text();
      
      const res = await fetchWithRetry(getApiUrl("/api/feed/parse-csv"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ csvText }),
      });

      if (!res.ok) {
        throw new Error(`API Error: ${res.statusText} (${res.status})`);
      }

      const data: FeedParseResponse = await res.json();
      setProducts(data.products || []);
      setErrors(data.errors || []);

      if (data.products.length === 0 && data.errors.length > 0) {
        setApiError("Feed contains columns we parsed, but all rows failed validation. Check row standards.");
      }
      return true;
    } catch (err: any) {
      setApiError(err.message || "An unexpected error occurred while parsing CSV.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [getApiUrl]);

  const loadSampleFeed = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setApiError(null);
    setErrors([]);

    try {
      const res = await fetchWithRetry(getApiUrl("/api/feed/sample"), {
        method: "GET",
      });

      if (!res.ok) {
        throw new Error(`API Error: ${res.statusText} (${res.status})`);
      }

      const data = await res.json();
      setProducts(data.products || []);
      setErrors([]);
      return true;
    } catch (err: any) {
      setApiError(err.message || "An unexpected error occurred while loading samples.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [getApiUrl]);

  const clearFeed = useCallback(() => {
    setProducts([]);
    setErrors([]);
    setApiError(null);
  }, []);

  return {
    products,
    errors,
    loading,
    apiError,
    parseFeedJson,
    parseFeedCsv,
    loadSampleFeed,
    clearFeed,
    setProducts,
  };
}
