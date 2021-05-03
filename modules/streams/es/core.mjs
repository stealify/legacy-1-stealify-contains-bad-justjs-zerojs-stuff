// @ts-check
//export * from '@most/core/dist/index.es.js' changed tsconfig to esnext
import { curry2, compose, apply, id, reduce, map as map$2, append, findIndex, remove, curry3 } from './prelude.mjs';
import { asap, delay as delay$2, periodic as periodic$1, schedulerRelativeTo, currentTime, cancelTask } from './scheduler.mjs';
import { disposeNone, disposeBoth, disposeOnce, tryDispose as tryDispose$1, disposeAll } from './disposable.mjs';

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
function fatalError(e) {
    setTimeout(rethrow, 0, e);
}
function rethrow(e) {
    throw e;
}

/** @license MIT License (c) copyright 2010-2016 original author or authors */
const propagateTask = (run, value, sink) => new PropagateRunEventTask(run, value, sink);
const propagateEventTask = (value, sink) => new PropagateEventTask(value, sink);
const propagateEndTask = (sink) => new PropagateEndTask(sink);
const propagateErrorTask = (value, sink) => new PropagateErrorTask(value, sink);
class PropagateTask {
    constructor(sink) {
        this.sink = sink;
        this.active = true;
    }
    dispose() {
        this.active = false;
    }
    run(t) {
        if (!this.active) {
            return;
        }
        this.runIfActive(t);
    }
    error(t, e) {
        // TODO: Remove this check and just do this.sink.error(t, e)?
        if (!this.active) {
            return fatalError(e);
        }
        this.sink.error(t, e);
    }
}
class PropagateRunEventTask extends PropagateTask {
    constructor(runEvent, value, sink) {
        super(sink);
        this.runEvent = runEvent;
        this.value = value;
    }
    runIfActive(t) {
        this.runEvent(t, this.value, this.sink);
    }
}
class PropagateEventTask extends PropagateTask {
    constructor(value, sink) {
        super(sink);
        this.value = value;
    }
    runIfActive(t) {
        this.sink.event(t, this.value);
    }
}
class PropagateEndTask extends PropagateTask {
    runIfActive(t) {
        this.sink.end(t);
    }
}
class PropagateErrorTask extends PropagateTask {
    constructor(value, sink) {
        super(sink);
        this.value = value;
    }
    runIfActive(t) {
        this.sink.error(t, this.value);
    }
}

/** @license MIT License (c) copyright 2010-2017 original author or authors */
const empty = () => EMPTY;
const isCanonicalEmpty = (stream) => stream === EMPTY;
const containsCanonicalEmpty = (streams) => streams.some(isCanonicalEmpty);
class Empty {
    run(sink, scheduler) {
        return asap(propagateEndTask(sink), scheduler);
    }
}
const EMPTY = new Empty();

/** @license MIT License (c) copyright 2010-2017 original author or authors */
const never = () => NEVER;
class Never {
    run() {
        return disposeNone();
    }
}
const NEVER = new Never();

/** @license MIT License (c) copyright 2010-2017 original author or authors */
const at = (t, x) => new At(t, x);
class At {
    constructor(t, x) {
        this.time = t;
        this.value = x;
    }
    run(sink, scheduler) {
        return delay$2(this.time, propagateTask(runAt, this.value, sink), scheduler);
    }
}
function runAt(t, x, sink) {
    sink.event(t, x);
    sink.end(t);
}

/** @license MIT License (c) copyright 2010-2017 original author or authors */
const now = (x) => at(0, x);

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/**
 * Create a stream of events that occur at a regular period
 * @param {Number} period periodicity of events
 * @returns {Stream} new stream of periodic events, the event value is undefined
 */
const periodic = (period) => new Periodic(period);
class Periodic {
    constructor(period) {
        this.period = period;
    }
    run(sink, scheduler) {
        return periodic$1(this.period, propagateEventTask(undefined, sink), scheduler);
    }
}

const newStream = (run) => new StreamImpl(run);
class StreamImpl {
    constructor(run) {
        this.run = run;
    }
}

class SettableDisposable {
    constructor() {
        this.disposable = undefined;
        this.disposed = false;
    }
    setDisposable(disposable) {
        if (this.disposable !== undefined) {
            throw new Error('setDisposable called more than once');
        }
        this.disposable = disposable;
        if (this.disposed) {
            disposable.dispose();
        }
    }
    dispose() {
        if (this.disposed) {
            return;
        }
        this.disposed = true;
        if (this.disposable !== undefined) {
            this.disposable.dispose();
        }
    }
}

/** @license MIT License (c) copyright 2010-2017 original author or authors */
const runEffects = curry2((stream, scheduler) => new Promise((resolve, reject) => runStream(stream, scheduler, resolve, reject)));
function runStream(stream, scheduler, resolve, reject) {
    const disposable = new SettableDisposable();
    const observer = new RunEffectsSink(resolve, reject, disposable);
    disposable.setDisposable(stream.run(observer, scheduler));
}
class RunEffectsSink {
    constructor(end, error, disposable) {
        this._end = end;
        this._error = error;
        this._disposable = disposable;
        this.active = true;
    }
    event() { }
    end() {
        if (!this.active) {
            return;
        }
        this.dispose(this._error, this._end, undefined);
    }
    error(_t, e) {
        this.dispose(this._error, this._error, e);
    }
    dispose(error, end, x) {
        this.active = false;
        tryDispose(error, end, x, this._disposable);
    }
}
function tryDispose(error, end, x, disposable) {
    try {
        disposable.dispose();
    }
    catch (e) {
        error(e);
        return;
    }
    end(x);
}

/**
 * Run a Stream, sending all its events to the provided Sink.
 */
const run = (sink, scheduler, stream) => stream.run(sink, scheduler);

class RelativeSink {
    constructor(offset, sink) {
        this.sink = sink;
        this.offset = offset;
    }
    event(t, x) {
        this.sink.event(t + this.offset, x);
    }
    error(t, e) {
        this.sink.error(t + this.offset, e);
    }
    end(t) {
        this.sink.end(t + this.offset);
    }
}

/**
 * Create a stream with its own local clock
 * This transforms time from the provided scheduler's clock to a stream-local
 * clock (which starts at 0), and then *back* to the scheduler's clock before
 * propagating events to sink.  In other words, upstream sources will see local times,
 * and downstream sinks will see non-local (original) times.
 */
const withLocalTime = (origin, stream) => new WithLocalTime(origin, stream);
class WithLocalTime {
    constructor(origin, source) {
        this.origin = origin;
        this.source = source;
    }
    run(sink, scheduler) {
        return this.source.run(relativeSink(this.origin, sink), schedulerRelativeTo(this.origin, scheduler));
    }
}
/**
 * Accumulate offsets instead of nesting RelativeSinks, which can happen
 * with higher-order stream and combinators like continueWith when they're
 * applied recursively.
 */
const relativeSink = (origin, sink) => sink instanceof RelativeSink
    ? new RelativeSink(origin + sink.offset, sink.sink)
    : new RelativeSink(origin, sink);

class Pipe {
    constructor(sink) {
        this.sink = sink;
    }
    end(t) {
        return this.sink.end(t);
    }
    error(t, e) {
        return this.sink.error(t, e);
    }
}

/** @license MIT License (c) copyright 2010 original author or authors */
/**
 * Generalized feedback loop. Call a stepper function for each event. The stepper
 * will be called with 2 params: the current seed and the an event value.  It must
 * return a new { seed, value } pair. The `seed` will be fed back into the next
 * invocation of stepper, and the `value` will be propagated as the event value.
 * @param stepper loop step function
 * @param seed initial seed value passed to first stepper call
 * @param stream event stream
 * @returns new stream whose values are the `value` field of the objects
 * returned by the stepper
 */
const loop = (stepper, seed, stream) => isCanonicalEmpty(stream) ? empty()
    : new Loop(stepper, seed, stream);
class Loop {
    constructor(stepper, seed, source) {
        this.step = stepper;
        this.seed = seed;
        this.source = source;
    }
    run(sink, scheduler) {
        return this.source.run(new LoopSink(this.step, this.seed, sink), scheduler);
    }
}
class LoopSink extends Pipe {
    constructor(stepper, seed, sink) {
        super(sink);
        this.step = stepper;
        this.seed = seed;
    }
    event(t, x) {
        const result = this.step(this.seed, x);
        this.seed = result.seed;
        this.sink.event(t, result.value);
    }
}

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/**
 * Create a stream containing successive reduce results of applying f to
 * the previous reduce result and the current stream item.
 * @param f reducer function
 * @param initial initial value
 * @param stream stream to scan
 * @returns new stream containing successive reduce results
 */
const scan = (f, initial, stream) => new Scan(f, initial, stream);
class Scan {
    constructor(f, z, source) {
        this.source = source;
        this.f = f;
        this.value = z;
    }
    run(sink, scheduler) {
        const d1 = asap(propagateEventTask(this.value, sink), scheduler);
        const d2 = this.source.run(new ScanSink(this.f, this.value, sink), scheduler);
        return disposeBoth(d1, d2);
    }
}
class ScanSink extends Pipe {
    constructor(f, z, sink) {
        super(sink);
        this.f = f;
        this.value = z;
    }
    event(t, x) {
        const f = this.f;
        this.value = f(this.value, x);
        this.sink.event(t, this.value);
    }
}

/** @license MIT License (c) copyright 2010-2016 original author or authors */
const continueWith = (f, stream) => new ContinueWith(f, stream);
class ContinueWith {
    constructor(f, source) {
        this.f = f;
        this.source = source;
    }
    run(sink, scheduler) {
        return new ContinueWithSink(this.f, this.source, sink, scheduler);
    }
}
class ContinueWithSink extends Pipe {
    constructor(f, source, sink, scheduler) {
        super(sink);
        this.f = f;
        this.scheduler = scheduler;
        this.active = true;
        this.disposable = disposeOnce(source.run(this, scheduler));
    }
    event(t, x) {
        if (!this.active) {
            return;
        }
        this.sink.event(t, x);
    }
    end(t) {
        if (!this.active) {
            return;
        }
        tryDispose$1(t, this.disposable, this.sink);
        this.startNext(t, this.sink);
    }
    startNext(t, sink) {
        try {
            this.disposable = this.continue(this.f, t, sink);
        }
        catch (e) {
            sink.error(t, e);
        }
    }
    continue(f, t, sink) {
        return run(sink, this.scheduler, withLocalTime(t, f()));
    }
    dispose() {
        this.active = false;
        return this.disposable.dispose();
    }
}

/** @license MIT License (c) copyright 2010-2017 original author or authors */
const startWith = (x, stream) => continueWith(() => stream, now(x));

/** @license MIT License (c) copyright 2010-2016 original author or authors */
class Filter {
    constructor(p, source) {
        this.p = p;
        this.source = source;
    }
    run(sink, scheduler) {
        return this.source.run(new FilterSink(this.p, sink), scheduler);
    }
    /**
     * Create a filtered source, fusing adjacent filter.filter if possible
     * @param {function(x:*):boolean} p filtering predicate
     * @param {{run:function}} source source to filter
     * @returns {Filter} filtered source
     */
    static create(p, source) {
        if (isCanonicalEmpty(source)) {
            return source;
        }
        if (source instanceof Filter) {
            return new Filter(and(source.p, p), source.source);
        }
        return new Filter(p, source);
    }
}
class FilterSink extends Pipe {
    constructor(p, sink) {
        super(sink);
        this.p = p;
    }
    event(t, x) {
        const p = this.p;
        p(x) && this.sink.event(t, x);
    }
}
const and = (p, q) => (x) => p(x) && q(x);

/** @license MIT License (c) copyright 2010-2016 original author or authors */
class FilterMap {
    constructor(p, f, source) {
        this.p = p;
        this.f = f;
        this.source = source;
    }
    run(sink, scheduler) {
        return this.source.run(new FilterMapSink(this.p, this.f, sink), scheduler);
    }
}
class FilterMapSink extends Pipe {
    constructor(p, f, sink) {
        super(sink);
        this.p = p;
        this.f = f;
    }
    event(t, x) {
        const f = this.f;
        const p = this.p;
        p(x) && this.sink.event(t, f(x));
    }
}

/** @license MIT License (c) copyright 2010-2016 original author or authors */
class Map {
    constructor(f, source) {
        this.f = f;
        this.source = source;
    }
    run(sink, scheduler) {
        return this.source.run(new MapSink(this.f, sink), scheduler);
    }
    /**
     * Create a mapped source, fusing adjacent map.map, filter.map,
     * and filter.map.map if possible
     * @param {function(*):*} f mapping function
     * @param {{run:function}} source source to map
     * @returns {Map|FilterMap} mapped source, possibly fused
     */
    static create(f, source) {
        if (isCanonicalEmpty(source)) {
            return empty();
        }
        if (source instanceof Map) {
            return new Map(compose(f, source.f), source.source);
        }
        if (source instanceof Filter) {
            return new FilterMap(source.p, f, source.source);
        }
        return new Map(f, source);
    }
}
class MapSink extends Pipe {
    constructor(f, sink) {
        super(sink);
        this.f = f;
    }
    event(t, x) {
        const f = this.f;
        this.sink.event(t, f(x));
    }
}

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/**
 * Transform each value in the stream by applying f to each
 * @param f mapping function
 * @param stream stream to map
 * @returns stream containing items transformed by f
 */
const map = (f, stream) => Map.create(f, stream);
/**
* Replace each value in the stream with x
* @param x
* @param stream
* @returns stream containing items replaced with x
*/
const constant = (x, stream) => map(() => x, stream);
/**
* Perform a side effect for each item in the stream
* @param f side effect to execute for each item. The return value will be discarded.
* @param stream stream to tap
* @returns new stream containing the same items as this stream
*/
const tap = (f, stream) => new Tap(f, stream);
class Tap {
    constructor(f, source) {
        this.source = source;
        this.f = f;
    }
    run(sink, scheduler) {
        return this.source.run(new TapSink(this.f, sink), scheduler);
    }
}
class TapSink extends Pipe {
    constructor(f, sink) {
        super(sink);
        this.f = f;
    }
    event(t, x) {
        const f = this.f;
        f(x);
        this.sink.event(t, x);
    }
}

/** @license MIT License (c) copyright 2010-2016 original author or authors */
class IndexSink extends Pipe {
    constructor(i, sink) {
        super(sink);
        this.index = i;
        this.active = true;
        this.value = undefined;
    }
    event(t, x) {
        if (!this.active) {
            return;
        }
        this.value = x;
        this.sink.event(t, this);
    }
    end(t) {
        if (!this.active) {
            return;
        }
        this.active = false;
        this.sink.event(t, this);
    }
}

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
/**
 * TODO: find a better way (without `any`)
 */
function invoke(f, args) {
    /* eslint complexity: [2,7] */
    switch (args.length) {
        case 0: return f();
        case 1: return f(args[0]);
        case 2: return f(args[0], args[1]);
        case 3: return f(args[0], args[1], args[2]);
        case 4: return f(args[0], args[1], args[2], args[3]);
        case 5: return f(args[0], args[1], args[2], args[3], args[4]);
        default:
            return f.apply(undefined, args);
    }
}

/** @license MIT License (c) copyright 2010 original author or authors */
/**
 * Combine latest events from two streams
 * @param f function to combine most recent events
 * @param stream1
 * @param stream2
 * @returns stream containing the result of applying f to the most recent
 *  event of each input stream, whenever a new event arrives on any stream.
 */
const combine = (f, stream1, stream2) => combineArray(f, [stream1, stream2]);
/**
* Combine latest events from all input streams
* @param f function to combine most recent events
* @param streams most recent events
* @returns stream containing the result of applying f to the most recent
*  event of each input stream, whenever a new event arrives on any stream.
*/
const combineArray = (f, streams) => streams.length === 0 || containsCanonicalEmpty(streams) ? empty()
    : streams.length === 1 ? map(f, streams[0])
        : new Combine(f, streams);
class Combine {
    constructor(f, sources) {
        this.f = f;
        this.sources = sources;
    }
    run(sink, scheduler) {
        const l = this.sources.length;
        const disposables = new Array(l);
        const sinks = new Array(l);
        const mergeSink = new CombineSink(disposables, sinks.length, sink, this.f);
        for (let indexSink, i = 0; i < l; ++i) {
            indexSink = sinks[i] = new IndexSink(i, mergeSink);
            disposables[i] = this.sources[i].run(indexSink, scheduler);
        }
        return disposeAll(disposables);
    }
}
class CombineSink extends Pipe {
    constructor(disposables, length, sink, f) {
        super(sink);
        this.disposables = disposables;
        this.f = f;
        this.awaiting = length;
        this.values = new Array(length);
        this.hasValue = new Array(length).fill(false);
        this.activeCount = length;
    }
    event(t, indexedValue) {
        if (!indexedValue.active) {
            this.dispose(t, indexedValue.index);
            return;
        }
        const i = indexedValue.index;
        const awaiting = this.updateReady(i);
        this.values[i] = indexedValue.value;
        if (awaiting === 0) {
            this.sink.event(t, invoke(this.f, this.values));
        }
    }
    updateReady(index) {
        if (this.awaiting > 0) {
            if (!this.hasValue[index]) {
                this.hasValue[index] = true;
                this.awaiting -= 1;
            }
        }
        return this.awaiting;
    }
    dispose(t, index) {
        tryDispose$1(t, this.disposables[index], this.sink);
        if (--this.activeCount === 0) {
            this.sink.end(t);
        }
    }
}

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/**
 * Assume fs is a stream containing functions, and apply the latest function
 * in fs to the latest value in xs.
 * fs:         --f---------g--------h------>
 * xs:         -a-------b-------c-------d-->
 * ap(fs, xs): --fa-----fb-gb---gc--hc--hd->
 * @param {Stream} fs stream of functions to apply to the latest x
 * @param {Stream} xs stream of values to which to apply all the latest f
 * @returns {Stream} stream containing all the applications of fs to xs
 */
function ap(fs, xs) {
    return combine(apply, fs, xs);
}

/** @license MIT License (c) copyright 2010 original author or authors */
const mergeConcurrently = (concurrency, stream) => mergeMapConcurrently(id, concurrency, stream);
const mergeMapConcurrently = (f, concurrency, stream) => isCanonicalEmpty(stream) ? empty()
    : new MergeConcurrently(f, concurrency, stream);
class MergeConcurrently {
    constructor(f, concurrency, source) {
        this.f = f;
        this.concurrency = concurrency;
        this.source = source;
    }
    run(sink, scheduler) {
        return new Outer(this.f, this.concurrency, this.source, sink, scheduler);
    }
}
const isNonEmpty = (array) => array.length > 0;
class Outer {
    constructor(f, concurrency, source, sink, scheduler) {
        this.f = f;
        this.concurrency = concurrency;
        this.sink = sink;
        this.scheduler = scheduler;
        this.pending = [];
        this.current = [];
        this.disposable = disposeOnce(source.run(this, scheduler));
        this.active = true;
    }
    event(t, x) {
        this.addInner(t, x);
    }
    addInner(t, x) {
        if (this.current.length < this.concurrency) {
            this.startInner(t, x);
        }
        else {
            this.pending.push(x);
        }
    }
    startInner(t, x) {
        try {
            this.initInner(t, x);
        }
        catch (e) {
            this.error(t, e);
        }
    }
    initInner(t, x) {
        const innerSink = new Inner(t, this, this.sink);
        innerSink.disposable = mapAndRun(this.f, t, x, innerSink, this.scheduler);
        this.current.push(innerSink);
    }
    end(t) {
        this.active = false;
        tryDispose$1(t, this.disposable, this.sink);
        this.checkEnd(t);
    }
    error(t, e) {
        this.active = false;
        this.sink.error(t, e);
    }
    dispose() {
        this.active = false;
        this.pending.length = 0;
        this.disposable.dispose();
        disposeAll(this.current).dispose();
    }
    endInner(t, inner) {
        const i = this.current.indexOf(inner);
        if (i >= 0) {
            this.current.splice(i, 1);
        }
        tryDispose$1(t, inner, this);
        const pending = this.pending;
        if (isNonEmpty(pending)) {
            this.startInner(t, pending.shift());
        }
        else {
            this.checkEnd(t);
        }
    }
    checkEnd(t) {
        if (!this.active && this.current.length === 0) {
            this.sink.end(t);
        }
    }
}
const mapAndRun = (f, t, x, sink, scheduler) => f(x).run(sink, schedulerRelativeTo(t, scheduler));
class Inner {
    constructor(time, outer, sink) {
        this.time = time;
        this.outer = outer;
        this.sink = sink;
        this.disposable = disposeNone();
    }
    event(t, x) {
        this.sink.event(t + this.time, x);
    }
    end(t) {
        this.outer.endInner(t + this.time, this);
    }
    error(t, e) {
        this.outer.error(t + this.time, e);
    }
    dispose() {
        return this.disposable.dispose();
    }
}

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/**
 * Map each value in the stream to a new stream, and merge it into the
 * returned outer stream. Event arrival times are preserved.
 * @param f chaining function, must return a Stream
 * @param stream
 * @returns new stream containing all events from each stream returned by f
 */
const chain = (f, stream) => mergeMapConcurrently(f, Infinity, stream);
/**
 * Monadic join. Flatten a Stream<Stream<X>> to Stream<X> by merging inner
 * streams to the outer. Event arrival times are preserved.
 * @param stream stream of streams
 * @returns new stream containing all events of all inner streams
 */
const join = (stream) => mergeConcurrently(Infinity, stream);

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/**
 * Map each value in stream to a new stream, and concatenate them all
 * stream:              -a---b---cX
 * f(a):                 1-1-1-1X
 * f(b):                        -2-2-2-2X
 * f(c):                                -3-3-3-3X
 * stream.concatMap(f): -1-1-1-1-2-2-2-2-3-3-3-3X
 * @param f function to map each value to a stream
 * @param stream
 * @returns new stream containing all events from each stream returned by f
 */
const concatMap = (f, stream) => mergeMapConcurrently(f, 1, stream);

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/**
 * @returns stream containing events from two streams in time order.
 * If two events are simultaneous they will be merged in arbitrary order.
 */
function merge(stream1, stream2) {
    return mergeArray([stream1, stream2]);
}
/**
 * @param streams array of stream to merge
 * @returns stream containing events from all input observables
 * in time order.  If two events are simultaneous they will be merged in
 * arbitrary order.
 */
const mergeArray = (streams) => mergeStreams(withoutCanonicalEmpty(streams));
/**
 * This implements fusion/flattening for merge.  It will
 * fuse adjacent merge operations.  For example:
 * - a.merge(b).merge(c) effectively becomes merge(a, b, c)
 * - merge(a, merge(b, c)) effectively becomes merge(a, b, c)
 * It does this by concatenating the sources arrays of
 * any nested Merge sources, in effect "flattening" nested
 * merge operations into a single merge.
 * TODO: use {@link MergeArray}
 */
const mergeStreams = (streams) => streams.length === 0 ? empty()
    : streams.length === 1 ? streams[0]
        : new Merge(reduce(appendSources, [], streams));
const withoutCanonicalEmpty = (streams) => streams.filter(isNotCanonicalEmpty);
const isNotCanonicalEmpty = (stream) => !isCanonicalEmpty(stream);
const appendSources = (sources, stream) => sources.concat(stream instanceof Merge ? stream.sources : stream);
class Merge {
    constructor(sources) {
        this.sources = sources;
    }
    run(sink, scheduler) {
        const l = this.sources.length;
        const disposables = new Array(l);
        const sinks = new Array(l);
        const mergeSink = new MergeSink(disposables, sinks, sink);
        for (let indexSink, i = 0; i < l; ++i) {
            indexSink = sinks[i] = new IndexSink(i, mergeSink);
            disposables[i] = this.sources[i].run(indexSink, scheduler);
        }
        return disposeAll(disposables);
    }
}
class MergeSink extends Pipe {
    constructor(disposables, sinks, sink) {
        super(sink);
        this.disposables = disposables;
        this.activeCount = sinks.length;
    }
    event(t, indexValue) {
        if (!indexValue.active) {
            this.dispose(t, indexValue.index);
            return;
        }
        this.sink.event(t, indexValue.value);
    }
    dispose(t, index) {
        tryDispose$1(t, this.disposables[index], this.sink);
        if (--this.activeCount === 0) {
            this.sink.end(t);
        }
    }
}

/** @license MIT License (c) copyright 2010 original author or authors */
const sample = (values, sampler) => snapshot(x => x, values, sampler);
const snapshot = (f, values, sampler) => isCanonicalEmpty(sampler) || isCanonicalEmpty(values)
    ? empty()
    : new Snapshot(f, values, sampler);
class Snapshot {
    constructor(f, values, sampler) {
        this.f = f;
        this.values = values;
        this.sampler = sampler;
    }
    run(sink, scheduler) {
        const sampleSink = new SnapshotSink(this.f, sink);
        const valuesDisposable = this.values.run(sampleSink.latest, scheduler);
        const samplerDisposable = this.sampler.run(sampleSink, scheduler);
        return disposeBoth(samplerDisposable, valuesDisposable);
    }
}
class SnapshotSink extends Pipe {
    constructor(f, sink) {
        super(sink);
        this.f = f;
        this.latest = new LatestValueSink(this);
    }
    event(t, x) {
        if (this.latest.hasValue) {
            const f = this.f;
            // TODO: value should be boxed to avoid ! bang
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.sink.event(t, f(this.latest.value, x));
        }
    }
}
class LatestValueSink extends Pipe {
    constructor(sink) {
        super(sink);
        this.hasValue = false;
    }
    event(_t, x) {
        this.value = x;
        this.hasValue = true;
    }
    end() { }
}

/** @license MIT License (c) copyright 2010 original author or authors */
// Construct a constrained bounds
const boundsFrom = (unsafeMin, unsafeMax) => {
    const min = Math.max(0, unsafeMin);
    const max = Math.max(min, unsafeMax);
    return { min, max };
};
// Combine 2 bounds by narrowing min and max
const mergeBounds = (b1, b2) => boundsFrom(b1.min + b2.min, Math.min(b1.max, b1.min + b2.max));
// Nil bounds excludes all slice indices
const isNilBounds = (b) => b.min >= b.max;
// Infinite bounds includes all slice indices
const isInfiniteBounds = (b) => b.min <= 0 && b.max === Infinity;

// TODO: split into smaller files
/**
 * @param n
 * @param stream
 * @returns new stream containing only up to the first n items from stream
 */
const take = (n, stream) => slice(0, n, stream);
/**
 * @param n
 * @param stream
 * @returns new stream with the first n items removed
 */
const skip = (n, stream) => slice(n, Infinity, stream);
/**
 * Slice a stream by index. Negative start/end indexes are not supported
 * @param start
 * @param end
 * @param stream
 * @returns stream containing items where start <= index < end
 */
const slice = (start, end, stream) => sliceBounds(boundsFrom(start, end), stream);
const sliceBounds = (bounds, stream) => isSliceEmpty(bounds, stream) ? empty()
    : stream instanceof Map ? commuteMapSlice(bounds, stream)
        : stream instanceof Slice ? fuseSlice(bounds, stream)
            : createSlice(bounds, stream);
const isSliceEmpty = (bounds, stream) => isCanonicalEmpty(stream) || isNilBounds(bounds);
const createSlice = (bounds, stream) => isInfiniteBounds(bounds) ? stream : new Slice(bounds, stream);
const commuteMapSlice = (bounds, mapStream) => Map.create(mapStream.f, sliceBounds(bounds, mapStream.source));
const fuseSlice = (bounds, sliceStream) => sliceBounds(mergeBounds(sliceStream.bounds, bounds), sliceStream.source);
class Slice {
    constructor(bounds, source) {
        this.source = source;
        this.bounds = bounds;
    }
    run(sink, scheduler) {
        const disposable = new SettableDisposable();
        const sliceSink = new SliceSink(this.bounds.min, this.bounds.max - this.bounds.min, sink, disposable);
        disposable.setDisposable(this.source.run(sliceSink, scheduler));
        return disposable;
    }
}
class SliceSink extends Pipe {
    constructor(skip, take, sink, disposable) {
        super(sink);
        this.skip = skip;
        this.take = take;
        this.disposable = disposable;
    }
    event(t, x) {
        /* eslint complexity: [1, 4] */
        if (this.skip > 0) {
            this.skip -= 1;
            return;
        }
        if (this.take === 0) {
            return;
        }
        this.take -= 1;
        this.sink.event(t, x);
        if (this.take === 0) {
            this.disposable.dispose();
            this.sink.end(t);
        }
    }
}
const takeWhile = (p, stream) => isCanonicalEmpty(stream) ? empty()
    : new TakeWhile(p, stream);
class TakeWhile {
    constructor(p, source) {
        this.p = p;
        this.source = source;
    }
    run(sink, scheduler) {
        const disposable = new SettableDisposable();
        const takeWhileSink = new TakeWhileSink(this.p, sink, disposable);
        disposable.setDisposable(this.source.run(takeWhileSink, scheduler));
        return disposable;
    }
}
class TakeWhileSink extends Pipe {
    constructor(p, sink, disposable) {
        super(sink);
        this.p = p;
        this.active = true;
        this.disposable = disposable;
    }
    event(t, x) {
        if (!this.active) {
            return;
        }
        const p = this.p;
        this.active = p(x);
        if (this.active) {
            this.sink.event(t, x);
        }
        else {
            this.disposable.dispose();
            this.sink.end(t);
        }
    }
}
const skipWhile = (p, stream) => isCanonicalEmpty(stream) ? empty()
    : new SkipWhile(p, stream);
class SkipWhile {
    constructor(p, source) {
        this.p = p;
        this.source = source;
    }
    run(sink, scheduler) {
        return this.source.run(new SkipWhileSink(this.p, sink), scheduler);
    }
}
class SkipWhileSink extends Pipe {
    constructor(p, sink) {
        super(sink);
        this.p = p;
        this.skipping = true;
    }
    event(t, x) {
        if (this.skipping) {
            const p = this.p;
            this.skipping = p(x);
            if (this.skipping) {
                return;
            }
        }
        this.sink.event(t, x);
    }
}
const skipAfter = (p, stream) => isCanonicalEmpty(stream) ? empty()
    : new SkipAfter(p, stream);
class SkipAfter {
    constructor(p, source) {
        this.p = p;
        this.source = source;
    }
    run(sink, scheduler) {
        return this.source.run(new SkipAfterSink(this.p, sink), scheduler);
    }
}
class SkipAfterSink extends Pipe {
    constructor(p, sink) {
        super(sink);
        this.p = p;
        this.skipping = false;
    }
    event(t, x) {
        if (this.skipping) {
            return;
        }
        const p = this.p;
        this.skipping = p(x);
        this.sink.event(t, x);
        if (this.skipping) {
            this.sink.end(t);
        }
    }
}

/** @license MIT License (c) copyright 2017 original author or authors */
const withItems = (items, stream) => zipItems(keepLeft, items, stream);
const zipItems = (f, items, stream) => isCanonicalEmpty(stream) || items.length === 0
    ? empty()
    : new ZipItems(f, items, take(items.length, stream));
const keepLeft = (a) => a;
class ZipItems {
    constructor(f, items, source) {
        this.f = f;
        this.items = items;
        this.source = source;
    }
    run(sink, scheduler) {
        return this.source.run(new ZipItemsSink(this.f, this.items, sink), scheduler);
    }
}
class ZipItemsSink extends Pipe {
    constructor(f, items, sink) {
        super(sink);
        this.f = f;
        this.items = items;
        this.index = 0;
    }
    event(t, b) {
        const f = this.f;
        this.sink.event(t, f(this.items[this.index], b));
        this.index += 1;
    }
}

// Copied and modified from https://github.com/invertase/denque
// MIT License
// These constants were extracted directly from denque's shift()
// It's not clear exactly why the authors chose these particular
// values, but given denque's stated goals, it seems likely that
// they were chosen for speed/memory reasons.
// Max value of _head at which Queue is willing to shink
// its internal array
const HEAD_MAX_SHRINK = 2;
// Min value of _tail at which Queue is willing to shink
// its internal array
const TAIL_MIN_SHRINK = 10000;
class Queue {
    constructor() {
        this.head = 0;
        this.tail = 0;
        this.capacityMask = 0x3;
        this.list = new Array(4);
    }
    push(x) {
        const tail = this.tail;
        this.list[tail] = x;
        this.tail = (tail + 1) & this.capacityMask;
        if (this.tail === this.head) {
            this.growArray();
        }
        if (this.head < this.tail) {
            return this.tail - this.head;
        }
        else {
            return this.capacityMask + 1 - (this.head - this.tail);
        }
    }
    shift() {
        const head = this.head;
        if (head === this.tail) {
            return undefined;
        }
        const x = this.list[head];
        this.list[head] = undefined;
        this.head = (head + 1) & this.capacityMask;
        if (head < HEAD_MAX_SHRINK &&
            this.tail > TAIL_MIN_SHRINK &&
            this.tail <= this.list.length >>> 2) {
            this.shrinkArray();
        }
        return x;
    }
    isEmpty() {
        return this.head === this.tail;
    }
    length() {
        if (this.head === this.tail) {
            return 0;
        }
        else if (this.head < this.tail) {
            return this.tail - this.head;
        }
        else {
            return this.capacityMask + 1 - (this.head - this.tail);
        }
    }
    growArray() {
        if (this.head) {
            // copy existing data, head to end, then beginning to tail.
            this.list = this.copyArray();
            this.head = 0;
        }
        // head is at 0 and array is now full, safe to extend
        this.tail = this.list.length;
        this.list.length *= 2;
        this.capacityMask = (this.capacityMask << 1) | 1;
    }
    shrinkArray() {
        this.list.length >>>= 1;
        this.capacityMask >>>= 1;
    }
    copyArray() {
        const newArray = [];
        const list = this.list;
        const len = list.length;
        let i;
        for (i = this.head; i < len; i++) {
            newArray.push(list[i]);
        }
        for (i = 0; i < this.tail; i++) {
            newArray.push(list[i]);
        }
        return newArray;
    }
}

/** @license MIT License (c) copyright 2010 original author or authors */
/**
 * Combine two streams pairwise by index by applying f to values at corresponding
 * indices.  The returned stream ends when either of the input streams ends.
 * @param {function} f function to combine values
 * @returns {Stream} new stream with items at corresponding indices combined
 *  using f
 */
function zip(f, stream1, stream2) {
    return zipArray(f, [stream1, stream2]);
}
/**
* Combine streams pairwise (or tuple-wise) by index by applying f to values
* at corresponding indices.  The returned stream ends when any of the input
* streams ends.
* @param {function} f function to combine values
* @param {[Stream]} streams streams to zip using f
* @returns {Stream} new stream with items at corresponding indices combined
*  using f
*/
const zipArray = (f, streams) => streams.length === 0 || containsCanonicalEmpty(streams) ? empty()
    : streams.length === 1 ? map(f, streams[0])
        : new Zip(f, streams);
class Zip {
    constructor(f, sources) {
        this.f = f;
        this.sources = sources;
    }
    run(sink, scheduler) {
        const l = this.sources.length;
        const disposables = new Array(l);
        const sinks = new Array(l);
        const buffers = new Array(l);
        const zipSink = new ZipSink(this.f, buffers, sinks, sink);
        for (let indexSink, i = 0; i < l; ++i) {
            buffers[i] = new Queue();
            indexSink = sinks[i] = new IndexSink(i, zipSink);
            disposables[i] = this.sources[i].run(indexSink, scheduler);
        }
        return disposeAll(disposables);
    }
}
class ZipSink extends Pipe {
    constructor(f, buffers, sinks, sink) {
        super(sink);
        this.f = f;
        this.sinks = sinks;
        this.buffers = buffers;
    }
    event(t, indexedValue) {
        /* eslint complexity: [1, 5] */
        if (!indexedValue.active) {
            this.dispose(t, indexedValue.index);
            return;
        }
        const buffers = this.buffers;
        const buffer = buffers[indexedValue.index];
        buffer.push(indexedValue.value);
        if (buffer.length() === 1) {
            if (!ready(buffers)) {
                return;
            }
            emitZipped(this.f, t, buffers, this.sink);
            if (ended(this.buffers, this.sinks)) {
                this.sink.end(t);
            }
        }
    }
    dispose(t, index) {
        const buffer = this.buffers[index];
        if (buffer.isEmpty()) {
            this.sink.end(t);
        }
    }
}
const emitZipped = (f, t, buffers, sink) => sink.event(t, invoke(f, map$2(head, buffers)));
const head = (buffer) => buffer.shift();
function ended(buffers, sinks) {
    for (let i = 0, l = buffers.length; i < l; ++i) {
        if (buffers[i].isEmpty() && !sinks[i].active) {
            return true;
        }
    }
    return false;
}
function ready(buffers) {
    for (let i = 0, l = buffers.length; i < l; ++i) {
        if (buffers[i].isEmpty()) {
            return false;
        }
    }
    return true;
}

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/**
 * Given a stream of streams, return a new stream that adopts the behavior
 * of the most recent inner stream.
 * @param stream of streams on which to switch
 * @returns switching stream
 */
const switchLatest = (stream) => isCanonicalEmpty(stream)
    ? empty()
    : new Switch(stream);
class Switch {
    constructor(source) {
        this.source = source;
    }
    run(sink, scheduler) {
        const switchSink = new SwitchSink(sink, scheduler);
        return disposeBoth(switchSink, this.source.run(switchSink, scheduler));
    }
}
class SwitchSink {
    constructor(sink, scheduler) {
        this.sink = sink;
        this.scheduler = scheduler;
        this.current = null;
        this.ended = false;
    }
    event(t, stream) {
        this.disposeCurrent(t);
        this.current = new Segment(stream, t, Infinity, this, this.sink, this.scheduler);
    }
    end(t) {
        this.ended = true;
        this.checkEnd(t);
    }
    error(t, e) {
        this.ended = true;
        this.sink.error(t, e);
    }
    dispose() {
        return this.disposeCurrent(currentTime(this.scheduler));
    }
    disposeCurrent(t) {
        if (this.current !== null) {
            return this.current.dispose(t);
        }
    }
    disposeInner(t, inner) {
        inner.dispose(t);
        if (inner === this.current) {
            this.current = null;
        }
    }
    checkEnd(t) {
        if (this.ended && this.current === null) {
            this.sink.end(t);
        }
    }
    endInner(t, inner) {
        this.disposeInner(t, inner);
        this.checkEnd(t);
    }
    errorInner(t, e, inner) {
        this.disposeInner(t, inner);
        this.sink.error(t, e);
    }
}
class Segment {
    constructor(source, min, max, outer, sink, scheduler) {
        this.min = min;
        this.max = max;
        this.outer = outer;
        this.sink = sink;
        this.disposable = source.run(this, schedulerRelativeTo(min, scheduler));
    }
    event(t, x) {
        const time = Math.max(0, t + this.min);
        if (time < this.max) {
            this.sink.event(time, x);
        }
    }
    end(t) {
        this.outer.endInner(t + this.min, this);
    }
    error(t, e) {
        this.outer.errorInner(t + this.min, e, this);
    }
    dispose(t) {
        tryDispose$1(t, this.disposable, this.sink);
    }
}

/** @license MIT License (c) copyright 2010-2016 original author or authors */
function filter(p, stream) {
    return Filter.create(p, stream);
}
/**
 * Skip repeated events, using === to detect duplicates
 * @param stream stream from which to omit repeated events
 * @returns stream without repeated events
 */
const skipRepeats = (stream) => skipRepeatsWith(same, stream);
/**
 * Skip repeated events using the provided equals function to detect duplicates
 * @param equals optional function to compare items
 * @param stream stream from which to omit repeated events
 * @returns stream without repeated events
 */
const skipRepeatsWith = (equals, stream) => isCanonicalEmpty(stream) ? empty()
    : new SkipRepeats(equals, stream);
class SkipRepeats {
    constructor(equals, source) {
        this.equals = equals;
        this.source = source;
    }
    run(sink, scheduler) {
        return this.source.run(new SkipRepeatsSink(this.equals, sink), scheduler);
    }
}
class SkipRepeatsSink extends Pipe {
    constructor(equals, sink) {
        super(sink);
        this.equals = equals;
        this.value = undefined;
        this.init = true;
    }
    event(t, x) {
        if (this.init) {
            this.init = false;
            this.value = x;
            this.sink.event(t, x);
            // TODO: value should be boxed to avoid ! bang
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        }
        else if (!this.equals(this.value, x)) {
            this.value = x;
            this.sink.event(t, x);
        }
    }
}
function same(a, b) {
    return a === b;
}

/** @license MIT License (c) copyright 2010-2016 original author or authors */
const until = (signal, stream) => new Until(signal, stream);
const since = (signal, stream) => new Since(signal, stream);
const during = (timeWindow, stream) => until(join(timeWindow), since(timeWindow, stream));
class Until {
    constructor(maxSignal, source) {
        this.maxSignal = maxSignal;
        this.source = source;
    }
    run(sink, scheduler) {
        const disposable = new SettableDisposable();
        const d1 = this.source.run(sink, scheduler);
        const d2 = this.maxSignal.run(new UntilSink(sink, disposable), scheduler);
        disposable.setDisposable(disposeBoth(d1, d2));
        return disposable;
    }
}
class Since {
    constructor(minSignal, source) {
        this.minSignal = minSignal;
        this.source = source;
    }
    run(sink, scheduler) {
        const min = new LowerBoundSink(this.minSignal, sink, scheduler);
        const d = this.source.run(new SinceSink(min, sink), scheduler);
        return disposeBoth(min, d);
    }
}
class SinceSink extends Pipe {
    constructor(min, sink) {
        super(sink);
        this.min = min;
    }
    event(t, x) {
        if (this.min.allow) {
            this.sink.event(t, x);
        }
    }
}
class LowerBoundSink extends Pipe {
    constructor(signal, sink, scheduler) {
        super(sink);
        this.allow = false;
        this.disposable = signal.run(this, scheduler);
    }
    event() {
        this.allow = true;
        this.dispose();
    }
    end() { }
    dispose() {
        this.disposable.dispose();
    }
}
class UntilSink extends Pipe {
    constructor(sink, disposable) {
        super(sink);
        this.disposable = disposable;
    }
    event(t) {
        this.disposable.dispose();
        this.sink.end(t);
    }
    end() { }
}

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/**
 * @param delayTime milliseconds to delay each item
 * @param stream
 * @returns new stream containing the same items, but delayed by ms
 */
const delay = (delayTime, stream) => delayTime <= 0 ? stream : new Delay(delayTime, stream);
class Delay {
    constructor(dt, source) {
        this.dt = dt;
        this.source = source;
    }
    run(sink, scheduler) {
        const delaySink = new DelaySink(this.dt, sink, scheduler);
        return disposeBoth(delaySink, this.source.run(delaySink, scheduler));
    }
}
class DelaySink extends Pipe {
    constructor(dt, sink, scheduler) {
        super(sink);
        this.dt = dt;
        this.scheduler = scheduler;
        this.tasks = [];
    }
    dispose() {
        this.tasks.forEach(cancelTask);
    }
    event(_t, x) {
        this.tasks.push(delay$2(this.dt, propagateEventTask(x, this.sink), this.scheduler));
    }
    end() {
        this.tasks.push(delay$2(this.dt, propagateEndTask(this.sink), this.scheduler));
    }
}

/** @license MIT License (c) copyright 2010-2017 original author or authors */
/**
 * Limit the rate of events by suppressing events that occur too often
 * @param period time to suppress events
 * @param stream
 */
const throttle = (period, stream) => isCanonicalEmpty(stream) ? empty()
    : stream instanceof Map ? commuteMapThrottle(period, stream)
        : stream instanceof Throttle ? fuseThrottle(period, stream)
            : new Throttle(period, stream);
const commuteMapThrottle = (period, mapStream) => Map.create(mapStream.f, throttle(period, mapStream.source));
const fuseThrottle = (period, throttleStream) => new Throttle(Math.max(period, throttleStream.period), throttleStream.source);
class Throttle {
    constructor(period, source) {
        this.period = period;
        this.source = source;
    }
    run(sink, scheduler) {
        return this.source.run(new ThrottleSink(this.period, sink), scheduler);
    }
}
class ThrottleSink extends Pipe {
    constructor(period, sink) {
        super(sink);
        this.time = 0;
        this.period = period;
    }
    event(t, x) {
        if (t >= this.time) {
            this.time = t + this.period;
            this.sink.event(t, x);
        }
    }
}
/**
 * Wait for a burst of events to subside and emit only the last event in the burst
 * @param period events occuring more frequently than this will be suppressed
 * @param stream stream to debounce
 * @returns new debounced stream
 */
const debounce = (period, stream) => isCanonicalEmpty(stream) ? empty()
    : new Debounce(period, stream);
class Debounce {
    constructor(dt, source) {
        this.dt = dt;
        this.source = source;
    }
    run(sink, scheduler) {
        return new DebounceSink(this.dt, this.source, sink, scheduler);
    }
}
class DebounceSink {
    constructor(dt, source, sink, scheduler) {
        this.dt = dt;
        this.sink = sink;
        this.scheduler = scheduler;
        this.timer = null;
        this.disposable = source.run(this, scheduler);
    }
    event(_t, x) {
        this.clearTimer();
        this.value = x;
        this.timer = delay$2(this.dt, new DebounceTask(this, x), this.scheduler);
    }
    handleEventFromTask(t, x) {
        this.clearTimer();
        this.sink.event(t, x);
    }
    end(t) {
        if (this.clearTimer()) {
            // TODO: value should be boxed to avoid ! bang
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.sink.event(t, this.value);
            this.value = undefined;
        }
        this.sink.end(t);
    }
    error(t, x) {
        this.clearTimer();
        this.sink.error(t, x);
    }
    dispose() {
        this.clearTimer();
        this.disposable.dispose();
    }
    clearTimer() {
        if (this.timer === null) {
            return false;
        }
        this.timer.dispose();
        this.timer = null;
        return true;
    }
}
class DebounceTask {
    constructor(sink, value) {
        this.sink = sink;
        this.value = value;
    }
    run(t) {
        this.sink.handleEventFromTask(t, this.value);
    }
    error(t, e) {
        this.sink.error(t, e);
    }
    dispose() { }
}

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/**
 * Turn a Stream<Promise<T>> into Stream<T> by awaiting each promise.
 * Event order is preserved. The stream will fail if any promise rejects.
 */
const awaitPromises = (stream) => isCanonicalEmpty(stream) ? empty() : new Await(stream);
/**
 * Create a stream containing only the promise's fulfillment
 * value at the time it fulfills.
 * @param promise
 * @return stream containing promise's fulfillment value.
 *  If the promise rejects, the stream will error
 */
const fromPromise = (promise) => awaitPromises(now(promise));
class Await {
    constructor(source) {
        this.source = source;
    }
    run(sink, scheduler) {
        return this.source.run(new AwaitSink(sink, scheduler), scheduler);
    }
}
class AwaitSink {
    constructor(sink, scheduler) {
        // Pre-create closures, to avoid creating them per event
        this.eventBound = (x) => this.sink.event(currentTime(this.scheduler), x);
        this.endBound = () => this.sink.end(currentTime(this.scheduler));
        this.errorBound = (e) => this.sink.error(currentTime(this.scheduler), e);
        this.sink = sink;
        this.scheduler = scheduler;
        this.queue = Promise.resolve();
    }
    event(_t, promise) {
        this.queue = this.queue.then(() => this.handlePromise(promise))
            .catch(this.errorBound);
    }
    end() {
        this.queue = this.queue.then(this.endBound)
            .catch(this.errorBound);
    }
    error(_t, e) {
        // Don't resolve error values, propagate directly
        this.queue = this.queue.then(() => this.errorBound(e))
            .catch(fatalError);
    }
    handlePromise(promise) {
        return promise.then(this.eventBound);
    }
}

class SafeSink {
    constructor(sink) {
        this.sink = sink;
        this.active = true;
    }
    event(t, x) {
        if (!this.active) {
            return;
        }
        this.sink.event(t, x);
    }
    end(t) {
        if (!this.active) {
            return;
        }
        this.disable();
        this.sink.end(t);
    }
    error(t, e) {
        this.disable();
        this.sink.error(t, e);
    }
    disable() {
        this.active = false;
        return this.sink;
    }
}

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */
function tryEvent(t, x, sink) {
    try {
        sink.event(t, x);
    }
    catch (e) {
        sink.error(t, e);
    }
}
function tryEnd(t, sink) {
    try {
        sink.end(t);
    }
    catch (e) {
        sink.error(t, e);
    }
}

/** @license MIT License (c) copyright 2010-2016 original author or authors */
/**
 * If stream encounters an error, recover and continue with items from stream
 * returned by f.
 * @param f which returns a new stream
 * @param stream
 * @returns new stream which will recover from an error by calling f
 */
const recoverWith = (f, stream) => isCanonicalEmpty(stream) ? empty()
    : new RecoverWith(f, stream);
/**
 * Create a stream containing only an error
 * @param e error value, preferably an Error or Error subtype
 * @returns new stream containing only an error
 */
const throwError = (e) => new ErrorStream(e);
class ErrorStream {
    constructor(e) {
        this.value = e;
    }
    run(sink, scheduler) {
        return asap(propagateErrorTask(this.value, sink), scheduler);
    }
}
class RecoverWith {
    constructor(f, source) {
        this.f = f;
        this.source = source;
    }
    run(sink, scheduler) {
        return new RecoverWithSink(this.f, this.source, sink, scheduler);
    }
}
class RecoverWithSink {
    constructor(f, source, sink, scheduler) {
        this.f = f;
        this.sink = new SafeSink(sink);
        this.scheduler = scheduler;
        this.disposable = source.run(this, scheduler);
    }
    event(t, x) {
        tryEvent(t, x, this.sink);
    }
    end(t) {
        tryEnd(t, this.sink);
    }
    error(t, e) {
        const nextSink = this.sink.disable();
        tryDispose$1(t, this.disposable, this.sink);
        this._startNext(t, e, nextSink);
    }
    _startNext(t, x, sink) {
        try {
            this.disposable = this._continue(this.f, t, x, sink);
        }
        catch (e) {
            sink.error(t, e);
        }
    }
    _continue(f, t, x, sink) {
        return run(sink, this.scheduler, withLocalTime(t, f(x)));
    }
    dispose() {
        return this.disposable.dispose();
    }
}

const multicast = (stream) => stream instanceof Multicast || isCanonicalEmpty(stream)
    ? stream
    : new Multicast(stream);
class Multicast {
    constructor(source) {
        this.source = new MulticastSource(source);
    }
    run(sink, scheduler) {
        return this.source.run(sink, scheduler);
    }
}
class MulticastSource {
    constructor(source) {
        this.source = source;
        this.sinks = [];
        this.disposable = disposeNone();
    }
    run(sink, scheduler) {
        const n = this.add(sink);
        if (n === 1) {
            this.disposable = this.source.run(this, scheduler);
        }
        return disposeOnce(new MulticastDisposable(this, sink));
    }
    dispose() {
        const disposable = this.disposable;
        this.disposable = disposeNone();
        return disposable.dispose();
    }
    add(sink) {
        this.sinks = append(sink, this.sinks);
        return this.sinks.length;
    }
    remove(sink) {
        const i = findIndex(sink, this.sinks);
        // istanbul ignore next
        if (i >= 0) {
            this.sinks = remove(i, this.sinks);
        }
        return this.sinks.length;
    }
    event(time, value) {
        const s = this.sinks;
        if (s.length === 1) {
            return s[0].event(time, value);
        }
        for (let i = 0; i < s.length; ++i) {
            tryEvent(time, value, s[i]);
        }
    }
    end(time) {
        const s = this.sinks;
        for (let i = 0; i < s.length; ++i) {
            tryEnd(time, s[i]);
        }
    }
    error(time, err) {
        const s = this.sinks;
        for (let i = 0; i < s.length; ++i) {
            s[i].error(time, err);
        }
    }
}
class MulticastDisposable {
    constructor(source, sink) {
        this.source = source;
        this.sink = sink;
    }
    dispose() {
        if (this.source.remove(this.sink) === 0) {
            this.source.dispose();
        }
    }
}

/** @license MIT License (c) copyright 2016 original author or authors */
const run$1 = curry3(run);
const withLocalTime$1 = curry2(withLocalTime);
const loop$1 = curry3(loop);
const scan$1 = curry3(scan);
const startWith$1 = curry2(startWith);
const map$1 = curry2(map);
const constant$1 = curry2(constant);
const tap$1 = curry2(tap);
const ap$1 = curry2(ap);
const chain$1 = curry2(chain);
const continueWith$1 = curry2(continueWith);
const concatMap$1 = curry2(concatMap);
const mergeConcurrently$1 = curry2(mergeConcurrently);
const mergeMapConcurrently$1 = curry3(mergeMapConcurrently);
const merge$1 = curry2(merge);
const combine$1 = curry3(combine);
const combineArray$1 = curry2(combineArray);
const sample$1 = curry2(sample);
const snapshot$1 = curry3(snapshot);
const zipItems$1 = curry3(zipItems);
const withItems$1 = curry2(withItems);
const zip$1 = curry3(zip);
const zipArray$1 = curry2(zipArray);
const filter$1 = curry2(filter);
const skipRepeatsWith$1 = curry2(skipRepeatsWith);
const take$1 = curry2(take);
const skip$1 = curry2(skip);
const slice$1 = curry3(slice);
const takeWhile$1 = curry2(takeWhile);
const skipWhile$1 = curry2(skipWhile);
const skipAfter$1 = curry2(skipAfter);
const until$1 = curry2(until);
const since$1 = curry2(since);
const during$1 = curry2(during);
const delay$1 = curry2(delay);
const throttle$1 = curry2(throttle);
const debounce$1 = curry2(debounce);
const recoverWith$1 = curry2(recoverWith);
const propagateTask$1 = curry3(propagateTask);
const propagateEventTask$1 = curry2(propagateEventTask);
const propagateErrorTask$1 = curry2(propagateErrorTask);

export { MulticastSource, ap$1 as ap, at, awaitPromises, chain$1 as chain, combine$1 as combine, combineArray$1 as combineArray, concatMap$1 as concatMap, constant$1 as constant, continueWith$1 as continueWith, debounce$1 as debounce, delay$1 as delay, during$1 as during, empty, filter$1 as filter, fromPromise, join, loop$1 as loop, map$1 as map, merge$1 as merge, mergeArray, mergeConcurrently$1 as mergeConcurrently, mergeMapConcurrently$1 as mergeMapConcurrently, multicast, never, newStream, now, periodic, propagateEndTask, propagateErrorTask$1 as propagateErrorTask, propagateEventTask$1 as propagateEventTask, propagateTask$1 as propagateTask, recoverWith$1 as recoverWith, run$1 as run, runEffects, sample$1 as sample, scan$1 as scan, since$1 as since, skip$1 as skip, skipAfter$1 as skipAfter, skipRepeats, skipRepeatsWith$1 as skipRepeatsWith, skipWhile$1 as skipWhile, slice$1 as slice, snapshot$1 as snapshot, startWith$1 as startWith, switchLatest, take$1 as take, takeWhile$1 as takeWhile, tap$1 as tap, throttle$1 as throttle, throwError, until$1 as until, withItems$1 as withItems, withLocalTime$1 as withLocalTime, zip$1 as zip, zipArray$1 as zipArray, zipItems$1 as zipItems };
//# sourceMappingURL=index.es.js.map

