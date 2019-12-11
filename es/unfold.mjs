import { map, startWith, switchLatest } from '@most/core';

// Create a stream that acts like the result of f(a) initially,
// and when each event arrives in sa, map it with f and switch to it.

const unfold = (f, a, sa) => switchLatest(map(f, startWith(a, sa)));

export { unfold };
//# sourceMappingURL=index.es.js.map