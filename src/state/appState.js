// =============================================
// src/state/appState.js
// App-level state + actions integrated with auth/apiClient
// =============================================
import { createStore } from "./store.js";
import { withPersist } from "./persist.js";
import { auth } from "../utils/auth.js";
import { apiClient } from "../utils/api_client.js";

const initial = {
  user: auth.getUser() || null,
  token: auth.getToken() || null,
  sidebarOpen: true,
  theme: "light",
};

// Keep a single store across HMR reloads
const GLOBAL_KEY = "__appState__";
const baseStore = window[GLOBAL_KEY] || createStore(initial);
window[GLOBAL_KEY] = baseStore;

export const appState = withPersist(baseStore, "appState", {
  version: 1,
  // Don't save token here (auth.js handles token/expiry). Persist UI prefs only.
  save: (s) => ({ user: s.user, sidebarOpen: s.sidebarOpen, theme: s.theme }),
});

// Hydrate api client with token if present
if (appState.get().token) apiClient.setToken(appState.get().token);

export const actions = {
  loginSuccess(result) {
    // result: { token, data }
    auth.setSession({ token: result.token, user: result.data });
    apiClient.setToken(result.token);
    appState.set({ user: result.data, token: result.token });
  },
  logout() {
    auth.clear();
    apiClient.setToken(null);
    appState.set({ user: null, token: null });
  },
  toggleSidebar(force) {
    appState.set((s) => ({
      sidebarOpen: typeof force === "boolean" ? force : !s.sidebarOpen,
    }));
  },
  setTheme(theme) {
    appState.set({ theme });
  },
};

// React to global auth events
window.addEventListener("auth:expired", () => actions.logout());

// --- Devtools hooks (DEV only) ---
if (import.meta.env.DEV) {
  // 1) Expose on window for Console access
  window.appState = appState;
  window.actions = actions;

  // 2) Log every state change (prev/next + changed keys)
  const changedKeys = (a, b) => {
    const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
    return [...keys].filter((k) => !Object.is(a?.[k], b?.[k]));
  };

  appState.subscribe(
    (s) => s,
    (next, prev) => {
      const keys = changedKeys(prev, next);
      console.groupCollapsed(
        "%cappState change",
        "color:#10b981;font-weight:600",
        keys.length ? `→ ${keys.join(", ")}` : "(no diff)"
      );
      console.log("prev:", prev);
      console.log("next:", next);
      if (keys.length) console.log("changed keys:", keys);
      console.groupEnd();
    }
  );

  // 3) Optional: wire to Redux DevTools extension if installed
  const rdx = window.__REDUX_DEVTOOLS_EXTENSION__?.connect({
    name: "appState",
  });
  if (rdx) {
    rdx.init(appState.get());
    appState.subscribe(
      (s) => s,
      (next) => rdx.send({ type: "STATE_CHANGE" }, next)
    );
  }
}
