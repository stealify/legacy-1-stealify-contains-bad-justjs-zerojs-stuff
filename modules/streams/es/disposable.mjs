//export * from '@most/disposable/dist/index.es.js' tsconfig esnext
import { curry2, reduce, concat, append, curry3 } from './prelude.mjs';

const dispose = (disposable) => disposable.dispose();

const disposeNone = () => ({
    dispose() {/**NoOp*/},
    isDisposeNone: true;
});
const isDisposeNone = d => d?.isDisposeNone;

/**
 * Wrap an existing disposable (which may not already have been once()d)
 * so that it will only dispose its underlying resource at most once.
 */
const disposeOnce = (disposable) => new DisposeOnce(disposable);
class DisposeOnce {
    constructor(disposable) {
        this.disposed = false;
        this.disposable = disposable;
    }
    dispose() {
        if (!this.disposed) {
            this.disposed = true;
            if (this.disposable) {
                this.disposable.dispose();
                this.disposable = undefined;
            }
        }
    }
}

/** @license MIT License (c) copyright 2010-2017 original author or authors */
/**
 * Create a Disposable that will use the provided
 * dispose function to dispose the resource
 */
const disposeWith = curry2((dispose, resource) => disposeOnce(new DisposeWithImpl(dispose, resource)));
/**
 * Disposable represents a resource that must be
 * disposed/released. It aggregates a function to dispose
 * the resource and a handle to a key/id/handle/reference
 * that identifies the resource
 */
class DisposeWithImpl {
    constructor(dispose, resource) {
        this._dispose = dispose;
        this._resource = resource;
    }
    dispose() {
        this._dispose(this._resource);
    }
}

/** @license MIT License (c) copyright 2010 original author or authors */
/**
 * Aggregate a list of disposables into a DisposeAll
 */
const disposeAll = (ds) => {
    const merged = reduce(merge, [], ds);
    return merged.length === 0 ? disposeNone() : new DisposeAll(merged);
};
/**
 * Convenience to aggregate 2 disposables
 */
const disposeBoth = curry2((d1, d2) => disposeAll([d1, d2]));
const merge = (ds, d) => isDisposeNone(d) ? ds
    : d instanceof DisposeAll ? concat(ds, d.disposables)
        : append(d, ds);
class DisposeAll {
    constructor(disposables) {
        this.disposables = disposables;
    }
    dispose() {
        throwIfErrors(disposeCollectErrors(this.disposables));
    }
}
/**
 * Dispose all, safely collecting errors into an array
 */
const disposeCollectErrors = (disposables) => reduce(appendIfError, [], disposables);
/**
 * Call dispose and if throws, append thrown error to errors
 */
const appendIfError = (errors, d) => {
    try {
        d.dispose();
    }
    catch (e) {
        errors.push(e);
    }
    return errors;
};
/**
 * Throw DisposeAllError if errors is non-empty
 * @throws
 */
const throwIfErrors = (errors) => {
    if (errors.length > 0) {
        throw new DisposeAllError(`${errors.length} errors`, errors);
    }
};
class DisposeAllError extends Error {
    constructor(message, errors) {
        super(message);
        this.name = 'DisposeAllError';
        this.message = message;
        this.errors = errors;
        //Error.call(this, message);
        //if (this.captureStackTrace) {
        //    this.captureStackTrace(this, DisposeAllError);
        //}
        this.stack = `${this.stack}${formatErrorStacks(this.errors)}`;
    }
}
//DisposeAllError.prototype = Object.create(Error.prototype);
/* Change to upstream not possible as its using typescript we made it a nativ extending class */

const formatErrorStacks = (errors) => reduce(formatErrorStack, '', errors);
const formatErrorStack = (s, e, i) => s + `\n[${(i + 1)}] ${e.stack}`;

/** @license MIT License (c) copyright 2010-2017 original author or authors */
// Try to dispose the disposable.  If it throws, send
// the error to sink.error with the provided Time value
const tryDispose = curry3((t, disposable, sink) => {
    try {
        disposable.dispose();
    }
    catch (e) {
        sink.error(t, e);
    }
});

export { DisposeAllError, dispose, disposeAll, disposeBoth, disposeNone, disposeOnce, disposeWith, isDisposeNone, tryDispose };
//# sourceMappingURL=index.es.js.map
