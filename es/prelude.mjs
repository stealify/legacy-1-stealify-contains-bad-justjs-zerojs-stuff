//export * from '@most/prelude/dist/index.es.js' esnext tsconfig
/** @license MIT License (c) copyright 2010-2016 original author or authors */
// Non-mutating array operations
/**
 * a with x prepended
 */
function cons(x, a) {
    const l = a.length;
    const b = new Array(l + 1);
    b[0] = x;
    for (let i = 0; i < l; ++i) {
        b[i + 1] = a[i];
    }
    return b;
}
/**
 * a with x appended
 */
function append(x, a) {
    const l = a.length;
    const b = new Array(l + 1);
    for (let i = 0; i < l; ++i) {
        b[i] = a[i];
    }
    b[l] = x;
    return b;
}
/**
 * Concats two `ArrayLike`s
 */
function concat(a, b) {
    const al = a.length;
    const bl = b.length;
    const r = new Array(al + bl);
    let i = 0;
    for (i = 0; i < al; i++) {
        r[i] = a[i];
    }
    for (let j = 0; j < bl; j++) {
        r[i++] = b[j];
    }
    return r;
}
//
/**
 * drop first n elements
 */
function drop(n, a) {
    if (n < 0) {
        throw new TypeError('n must be >= 0');
    }
    const l = a.length;
    if (n === 0 || l === 0) {
        return a;
    }
    if (n >= l) {
        return [];
    }
    return unsafeDrop(n, a, l - n);
}
/**
 * Internal helper for drop
 */
function unsafeDrop(n, a, l) {
    const b = new Array(l);
    for (let i = 0; i < l; ++i) {
        b[i] = a[n + i];
    }
    return b;
}
/**
 * drop head element
 */
function tail(a) {
    return drop(1, a);
}
/**
 * duplicate a (shallow duplication)
 */
function copy(a) {
    const l = a.length;
    const b = new Array(l);
    for (let i = 0; i < l; ++i) {
        b[i] = a[i];
    }
    return b;
}
/**
 * transform each element with f
 */
function map(f, a) {
    const l = a.length;
    const b = new Array(l);
    for (let i = 0; i < l; ++i) {
        b[i] = f(a[i]);
    }
    return b;
}
/**
 * accumulate via left-fold
 */
function reduce(f, z, a) {
    let r = z;
    for (let i = 0, l = a.length; i < l; ++i) {
        r = f(r, a[i], i);
    }
    return r;
}
/**
 * replace element at index
 */
function replace(x, i, a) {
    if (i < 0) {
        throw new TypeError('i must be >= 0');
    }
    const l = a.length;
    const b = new Array(l);
    for (let j = 0; j < l; ++j) {
        b[j] = i === j ? x : a[j];
    }
    return b;
}
/**
 * remove element at index
 * @throws
 */
function remove(i, a) {
    if (i < 0) {
        throw new TypeError('i must be >= 0');
    }
    const l = a.length;
    if (l === 0 || i >= l) { // exit early if index beyond end of array
        return a;
    }
    if (l === 1) { // exit early if index in bounds and length === 1
        return [];
    }
    return unsafeRemove(i, a, l - 1);
}
/**
 * Internal helper to remove element at index
 */
function unsafeRemove(i, a, l) {
    const b = new Array(l);
    let j;
    for (j = 0; j < i; ++j) {
        b[j] = a[j];
    }
    for (j = i; j < l; ++j) {
        b[j] = a[j + 1];
    }
    return b;
}
/**
 * remove all elements matching a predicate
 * @deprecated
 */
function removeAll(f, a) {
    const l = a.length;
    const b = new Array(l);
    let j = 0;
    for (let x, i = 0; i < l; ++i) {
        x = a[i];
        if (!f(x)) {
            b[j] = x;
            ++j;
        }
    }
    b.length = j;
    return b;
}
/**
 * find index of x in a, from the left
 */
function findIndex(x, a) {
    for (let i = 0, l = a.length; i < l; ++i) {
        if (x === a[i]) {
            return i;
        }
    }
    return -1;
}
/**
 * Return true iff x is array-like
 */
function isArrayLike(x) {
    return x != null && typeof x.length === 'number' && typeof x !== 'function';
}

/** @license MIT License (c) copyright 2010-2016 original author or authors */
const id = (x) => x;
const compose = (f, g) => (x) => f(g(x));
const apply = (f, x) => f(x);
function curry2(f) {
    function curried(a, b) {
        switch (arguments.length) {
            case 0: return curried;
            case 1: return (b) => f(a, b);
            default: return f(a, b);
        }
    }
    return curried;
}
function curry3(f) {
    function curried(a, b, c) {
        switch (arguments.length) {
            case 0: return curried;
            case 1: return curry2((b, c) => f(a, b, c));
            case 2: return (c) => f(a, b, c);
            default: return f(a, b, c);
        }
    }
    return curried;
}
function curry4(f) {
    function curried(a, b, c, d) {
        switch (arguments.length) {
            case 0: return curried;
            case 1: return curry3((b, c, d) => f(a, b, c, d));
            case 2: return curry2((c, d) => f(a, b, c, d));
            case 3: return (d) => f(a, b, c, d);
            default: return f(a, b, c, d);
        }
    }
    return curried;
}

export { append, apply, compose, concat, cons, copy, curry2, curry3, curry4, drop, findIndex, id, isArrayLike, map, reduce, remove, removeAll, replace, tail };
//# sourceMappingURL=index.es.js.map
