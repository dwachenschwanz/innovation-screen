// ===============================
// api_client.js — Vanilla JS, no deps
// ===============================
// Usage:
//   import { apiClient } from "./api_client.js";
//   const data = await apiClient.get("/path");

// If you have a config module, you can still import it.
// Otherwise, set BASE_URL via the constructor below.
import { SERVER_URL } from "/config.js"; // optional

class ApiClient {
  /**
   * @param {string} baseURL e.g. "https://example.com"
   * @param {{timeoutMs?: number, defaultHeaders?: Record<string,string>}} [opts]
   */
  constructor(baseURL, opts = {}) {
    if (!baseURL) throw new Error("ApiClient: baseURL is required");
    this.baseURL = baseURL.replace(/\/$/, "");
    this.timeoutMs = Number.isFinite(opts.timeoutMs) ? opts.timeoutMs : 30000;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...opts.defaultHeaders,
    };
    this._token = null; // Bearer / custom token
  }

  /** Set or clear the auth token */
  setToken(token) {
    this._token = token || null;
  }

  /**
   * Core request helper with timeout + basic retry (429/5xx)
   * @param {string} endpoint - path beginning with '/'
   * @param {RequestInit & {retry?: number, retryDelayMs?: number}} init
   */
  async request(endpoint, init = {}) {
    if (!endpoint.startsWith("/")) {
      throw new Error("ApiClient.request: endpoint must start with '/'");
    }

    const url = this.baseURL + endpoint;
    const headers = new Headers(this.defaultHeaders);

    // Merge headers (case-insensitive) from caller
    if (init.headers) {
      const h = new Headers(init.headers);
      for (const [k, v] of h.entries()) headers.set(k, v);
    }

    // Inject Authorization header when token present
    if (this._token && !headers.has("Authorization")) {
      headers.set("Authorization", `jwttoken ${this._token}`);
    }

    const method = (init.method || "GET").toUpperCase();

    // Auto-encode body as JSON if object provided and no body set
    let body = init.body;
    if (body == null && init.json != null) {
      body = JSON.stringify(init.json);
      if (!headers.has("Content-Type"))
        headers.set("Content-Type", "application/json");
    }

    // If method has no body, ensure undefined
    if (["GET", "HEAD"].includes(method)) body = undefined;

    // Timeout support
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(new DOMException("timeout", "AbortError")),
      this.timeoutMs
    );

    const retryMax = Number.isFinite(init.retry) ? init.retry : 2;
    const baseDelay = Number.isFinite(init.retryDelayMs)
      ? init.retryDelayMs
      : 400;

    let lastError;
    for (let attempt = 0; attempt <= retryMax; attempt++) {
      try {
        const resp = await fetch(url, {
          ...init,
          method,
          headers,
          body,
          signal: controller.signal,
        });

        // in ApiClient.request catch/after fetch:
        if (resp.status === 401 || resp.status === 403) {
          auth.clear();
          // optionally redirect to login
        }

        // 403: surface server message
        if (resp.status === 403) {
          let msg;
          try {
            msg = await resp.text();
          } catch {
            msg = "403 Forbidden";
          }
          throw new Error(msg);
        }

        // Retry on 429/5xx
        if (resp.status === 429 || (resp.status >= 500 && resp.status <= 599)) {
          if (attempt < retryMax) {
            const retryAfter = Number(resp.headers.get("Retry-After"));
            const delay = Number.isFinite(retryAfter)
              ? retryAfter * 1000
              : baseDelay * Math.pow(2, attempt);
            await new Promise((r) => setTimeout(r, delay));
            continue;
          }
        }

        if (!resp.ok) {
          // Non-JSON error bodies shouldn't throw during parse
          let details = await resp.text();
          throw new Error(`HTTP ${resp.status}: ${details || resp.statusText}`);
        }

        // Handle no content / different content types
        const ctype = resp.headers.get("Content-Type") || "";
        let result;
        if (resp.status === 204) {
          result = null;
        } else if (ctype.includes("application/json")) {
          result = await resp.json();
        } else {
          result = await resp.text();
        }

        // Auto-capture token if present
        if (result && typeof result === "object" && "token" in result) {
          this.setToken(result.token);
        }

        clearTimeout(timeout);
        return result;
      } catch (err) {
        lastError = err;
        // Abort error should not retry further unless attempts remain
        if (err?.name === "AbortError" || attempt === retryMax) {
          clearTimeout(timeout);
          throw err;
        }
      }
    }

    clearTimeout(timeout);
    throw lastError || new Error("Unknown request error");
  }

  get(endpoint, headers) {
    return this.request(endpoint, { method: "GET", headers });
  }
  post(endpoint, json, headers) {
    return this.request(endpoint, { method: "POST", json, headers });
  }
  put(endpoint, json, headers) {
    return this.request(endpoint, { method: "PUT", json, headers });
  }
  delete(endpoint, headers) {
    return this.request(endpoint, { method: "DELETE", headers });
  }
}

// Export a ready-to-use instance. Replace with your SERVER_URL as needed.
export const apiClient = new ApiClient(
  typeof SERVER_URL !== "undefined" ? SERVER_URL : location.origin
);
export { ApiClient };
