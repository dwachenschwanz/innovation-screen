// auth.js — minimal client-side auth session

const STORAGE_KEY = "smartorg.auth"; // change if you like

function b64urlToJson(b64url) {
  // base64url -> base64
  b64url = b64url.replace(/-/g, "+").replace(/_/g, "/");
  // pad
  while (b64url.length % 4) b64url += "=";
  const text = atob(b64url);
  try {
    return JSON.parse(decodeURIComponent(escape(text)));
  } catch {
    return JSON.parse(text);
  }
}

function parseJwt(token) {
  // JWT = header.payload.signature
  const [, payload] = token.split(".");
  if (!payload) return {};
  return b64urlToJson(payload); // { exp?: number, ... }
}

export const auth = {
  /** Save token + user profile. Auto-derives expiry from JWT `exp` if present. */
  setSession({ token, user }) {
    const { exp } = parseJwt(token); // seconds since epoch
    const expiresAt = exp ? exp * 1000 : Date.now() + 24 * 60 * 60 * 1000; // fallback 24h
    const session = { token, user, expiresAt };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  },

  /** Clear session (logout). */
  clear() {
    localStorage.removeItem(STORAGE_KEY);
  },

  /** Read raw session (null if missing/expired). */
  getSession() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      const s = JSON.parse(raw);
      if (!s.expiresAt || Date.now() >= s.expiresAt) {
        this.clear();
        return null;
      }
      return s;
    } catch {
      this.clear();
      return null;
    }
  },

  /** Convenience getters */
  getToken() {
    return this.getSession()?.token || null;
  },
  getUser() {
    return this.getSession()?.user || null;
  },
  isAuthenticated() {
    return !!this.getSession();
  },
};
