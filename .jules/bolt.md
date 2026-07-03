## 2026-07-03 - Intl.DateTimeFormat caching
**Learning:** Instantiating `Intl.DateTimeFormat` is surprisingly expensive. Creating it on every format call inside a React component or an interval function causes unnecessary CPU overhead.
**Action:** Cache the `Intl.DateTimeFormat` instance outside of the function or component and reuse it for formatting to improve performance.
## 2026-07-03 - Array includes Optimization **Learning:** Nested  operations inside array methods (like  or ) cause O(N*M) complexity. **Action:** Replace  lookups on arrays with  lookups on s or s for O(1) checks, or pre-compute indexes.
## 2026-07-03 - Array includes Optimization **Learning:** Nested `.includes()` operations inside array methods (like `.reduce` or `.filter`) cause O(N*M) complexity. **Action:** Replace `.includes()` lookups on arrays with `.has()` lookups on `Set`s or `Map`s for O(1) checks, or pre-compute indexes.
