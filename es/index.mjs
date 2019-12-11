import { loop, map } from './core.mjs';
// Replace event values with a 1-based count.
export const count = (sa) => keepIndex(withCount(sa));
// Pair event values with their associated 1-based count.
export const withCount = (sa) => withIndexStart(1, sa);
// Replace event values with a 0-based index.
export const index = (sa) => keepIndex(withIndex(sa));
// Pair event values with their associated 0-based index.
export const withIndex = (sa) => withIndexStart(0, sa);
// Pair event values with their associated `start`-based index.
export const withIndexStart = (start, sa) => indexed(i => [i, i + 1], start, sa);
// Pair event values with an iterative index
export const indexed = (f, init, sa) => loop((s, a) => {
    const [index, seed] = f(s);
    return { seed, value: [index, a] };
}, init, sa);
// Given an indexed Stream, keep only the index and discard the event values.
export const keepIndex = (s) => map(ia => ia[0], s);
//# sourceMappingURL=index.js.map