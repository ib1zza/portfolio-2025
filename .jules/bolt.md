## 2026-07-03 - Intl.DateTimeFormat caching
**Learning:** Instantiating `Intl.DateTimeFormat` is surprisingly expensive. Creating it on every format call inside a React component or an interval function causes unnecessary CPU overhead.

**Action:** Cache the `Intl.DateTimeFormat` instance outside of the function or component and reuse it for formatting to improve performance.
## 2026-07-03 - Array includes Optimization 
**Learning:** Nested  operations inside array methods (like  or ) cause O(N*M) complexity. 

**Action:** Replace  lookups on arrays with  lookups on s or s for O(1) checks, or pre-compute indexes.
## 2026-07-03 - Array includes Optimization 
**Learning:** Nested `.includes()` operations inside array methods (like `.reduce` or `.filter`) cause O(N*M) complexity. 

**Action:** Replace `.includes()` lookups on arrays with `.has()` lookups on `Set`s or `Map`s for O(1) checks, or pre-compute indexes.
## 2026-07-03 - Unconditional Await Performance Optimization
**Learning:** Awaiting an already-resolved promise (like `document.fonts?.ready`) still yields back to the event loop, taking roughly 1.5ms to 2ms in this app context. By synchronously checking state (like `document.fonts?.status !== "loaded"`) before the `await`, we can avoid the asynchronous overhead when the task is already complete.

**Action:** Always check the status if a synchronous check is available before unconditionally `await`ing a promise in a frequently called code path.
## 2026-07-03 - Space Invaders Collision Optimization
**Learning:** Utilizing array ordering properties (like elements initialized row by row and iterated backward) can allow for extremely efficient early loop exits in collision detection, yielding 60%+ performance gains without the overhead of building spatial hashes.

**Action:** Always check the underlying order and invariants of game state arrays when looking for O(N^2) loop optimizations.

## 2023-10-27 - [Optimize array chain methods] **Learning:** [Combining .filter(), .sort() and .map() on small arrays into a single .reduce() pass with an inline insertion sort can yield measurable ~15% performance improvement.] **Action:** [Use single-pass reduce + insertion sort on small arrays (<15 elements) inside critical execution paths, like search scoring logic.]
## 2025-02-26 - DOM Query Caching **Learning:** [Repeated DOM queries inside loops can cause significant performance bottlenecks.] **Action:** [Use document.querySelectorAll before the loop and cache the results in a Map for fast lookups, which showed a ~190x performance improvement.]
## 2023-10-27 - [Optimize array chain methods]
**Learning:** [Combining .filter(), .sort() and .map() on small arrays into a single .reduce() pass with an inline insertion sort can yield measurable ~15% performance improvement.]
**Action:** [Use single-pass reduce + insertion sort on small arrays (<15 elements) inside critical execution paths, like search scoring logic.]
## 2025-02-18 - [Optimize Easter Egg Progress Migration]
**Learning:** Store migration functions that map over elements using \`.some\` against static arrays cause unnecessary $O(N \times M)$ overhead.
**Action:** Extract static arrays into \`Set\` instances outside the function scope for O(1) lookups during migration and hydration.
