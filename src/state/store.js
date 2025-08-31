// =============================================
// src/state/store.js
// Tiny event-driven store with selectors
// =============================================
export function createStore(initialState = {}) {
  const target = new EventTarget();
  let state = initialState;

  const get = () => state;

  const set = (patch, { replace = false } = {}) => {
    const next =
      typeof patch === "function"
        ? patch(state)
        : replace
        ? patch
        : { ...state, ...patch };

    if (Object.is(next, state)) return;
    const prev = state;
    state = next;
    target.dispatchEvent(new CustomEvent("change", { detail: { prev, next } }));
  };

  const update = (fn) => set(fn);

  // Subscribe to a selected slice of state
  const subscribe = (
    selector = (s) => s,
    listener = () => {},
    eq = Object.is
  ) => {
    let selected = selector(state);
    const handler = (e) => {
      const nextSelected = selector(e.detail.next);
      if (!eq(selected, nextSelected)) {
        const prevSelected = selected;
        selected = nextSelected;
        listener(nextSelected, prevSelected, e.detail);
      }
    };
    target.addEventListener("change", handler);
    return () => target.removeEventListener("change", handler);
  };

  return { get, set, update, subscribe };
}

// Shallow equality helper for object slices
export function shallowEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (!a || !b || typeof a !== "object" || typeof b !== "object") return false;
  const ka = Object.keys(a),
    kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  for (const k of ka) if (!Object.is(a[k], b[k])) return false;
  return true;
}
