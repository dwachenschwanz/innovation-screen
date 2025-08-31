// =============================================
// src/state/persist.js
// LocalStorage persistence + cross-tab sync
// =============================================
export function withPersist(
  store,
  key,
  {
    version = 1,
    save = (s) => s, // transform before save
    load = (s) => s, // transform after load (migrations)
  } = {}
) {
  // Load once
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const { v, s } = JSON.parse(raw);
      if (v === version) store.set(load(s), { replace: true });
    }
  } catch {}

  // Save on change
  store.subscribe(
    (s) => s,
    (state) => {
      try {
        localStorage.setItem(
          key,
          JSON.stringify({ v: version, s: save(state) })
        );
      } catch {}
    }
  );

  // Cross-tab sync
  window.addEventListener("storage", (e) => {
    if (e.key !== key || e.newValue == null) return;
    try {
      const { v, s } = JSON.parse(e.newValue);
      if (v === version) store.set(load(s), { replace: true });
    } catch {}
  });

  return store;
}
