/** @license MIT License (c) copyright 2018 original author or authors */
/** @author usp */
import { disposeBoth, tryDispose } from './disposable.mjs';
import { curry2 } from './prelude.mjs';
import { schedulerRelativeTo, currentTime } from './scheduler.mjs';
// Curry the internal `_exhaustMap` and export it as an overloaded interface.
export const exhaustMap = curry2(_exhaustMap);
// Define an internal and uncurried interface for `exhaustMap`.
function _exhaustMap(fn, stream) {
    return new ExhaustMap(fn, stream);
}
// `ExhaustMap` is a higher-order stream which receives a map function and a source stream.
// It skips applying the map function when it has an active inner stream.
class ExhaustMap {
    constructor(fn, source) {
        this.fn = fn;
        this.source = source;
    }
    run(sink, scheduler) {
        const exhaustMapSink = new ExhaustMapSink(this.fn, sink, scheduler);
        return disposeBoth(exhaustMapSink, this.source.run(exhaustMapSink, scheduler));
    }
}
// `ExhaustMapSink` receives a map function which returns a stream.
// It applies the map function to a value from its source stream to get an inner stream.
// It proxies the events from the inner stream to its upper sink.
// It manages the lifecycle of its inner stream to skip mapping when it has an active stream.
class ExhaustMapSink {
    constructor(fn, sink, scheduler) {
        this.fn = fn;
        this.sink = sink;
        this.scheduler = scheduler;
        // Whether the stream itself is ended
        this.ended = false;
    }
    // Map the value from its source and run the stream as an inner stream when it does not have an active stream.
    event(t, value) {
        if (this.current === undefined) {
            const segment = new Segment(t, this, this.sink);
            // Keep this disposable as its current running one.
            this.current = this.fn(value).run(segment, schedulerRelativeTo(t, this.scheduler));
        }
    }
    // Mark it as `ended` then check if it has to propagate its upper sink as `ended`.
    end(t) {
        this.ended = true;
        this._checkEnd(t);
    }
    // Mark it as `ended` then propagate the error to its upper sink.
    error(t, error) {
        this.ended = true;
        this.sink.error(t, error);
    }
    // Propagate `dispose` to its current inner stream.
    dispose() {
        this._disposeCurrent(currentTime(this.scheduler));
    }
    // Try to dispose the current inner stream, then unset the current.
    _disposeCurrent(t) {
        if (this.current !== undefined) {
            tryDispose(t, this.current, this.sink);
            this.current = undefined;
        }
    }
    // Dispose the ended inner stream then check if the outer stream should `end` too.
    _endInner(t) {
        this._disposeCurrent(t);
        this._checkEnd(t);
    }
    // Dispose the dead inner stream then propagate the error to its upper sink.
    _errorInner(t, error) {
        this._disposeCurrent(t);
        this.sink.error(t, error);
    }
    // When it is marked as `ended` and does not have any active inner stream, emit `end` to the upper sink.
    _checkEnd(t) {
        if (this.ended && this.current === undefined) {
            this.sink.end(t);
        }
    }
}
// `Segment` receives a base time, an outer sink, and a second-level outer sink.
// It has its local time so that it should add its base time on emitting values to outside.
class Segment {
    constructor(time, outer, sink) {
        this.time = time;
        this.outer = outer;
        this.sink = sink;
    }
    // Propagate the value to its second-level outer sink.
    event(t, value) {
        this.sink.event(t + this.time, value);
    }
    // Notify its outer sink of its `end`.
    end(t) {
        this.outer._endInner(t + this.time);
    }
    // Notify its outer sink of its `error`.
    error(t, error) {
        this.outer._errorInner(t + this.time, error);
    }
}
//# sourceMappingURL=index.js.map