## 2026-07-03 - Intl.DateTimeFormat caching
**Learning:** Instantiating `Intl.DateTimeFormat` is surprisingly expensive. Creating it on every format call inside a React component or an interval function causes unnecessary CPU overhead.
**Action:** Cache the `Intl.DateTimeFormat` instance outside of the function or component and reuse it for formatting to improve performance.
## 2026-07-03 - Unconditional Await Performance Optimization
**Learning:** Awaiting an already-resolved promise (like `document.fonts?.ready`) still yields back to the event loop, taking roughly 1.5ms to 2ms in this app context. By synchronously checking state (like `document.fonts?.status !== "loaded"`) before the `await`, we can avoid the asynchronous overhead when the task is already complete.
**Action:** Always check the status if a synchronous check is available before unconditionally `await`ing a promise in a frequently called code path.
## 2026-07-03 - Space Invaders Collision Optimization
**Learning:** Utilizing array ordering properties (like elements initialized row by row and iterated backward) can allow for extremely efficient early loop exits in collision detection, yielding 60%+ performance gains without the overhead of building spatial hashes.
**Action:** Always check the underlying order and invariants of game state arrays when looking for O(N^2) loop optimizations.
