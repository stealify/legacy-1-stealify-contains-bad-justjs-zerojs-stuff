import { MulticastSource } from './core.mjs';
import { cancelTask, asap } from './scheduler.mjs';

const hold = (stream) => new Hold(stream);
class Hold extends MulticastSource {
    constructor() {
        super(...arguments);
        this.pendingSinks = [];
        this.held = undefined;
        this.task = undefined;
    }
    run(sink, scheduler) {
        if (this._shouldScheduleFlush()) {
            this._scheduleFlush(sink, scheduler);
        }
        // This also adds the new sink to the internal sinks array.
        // At this point, the sink is in both this.sinks and this.pendingSinks,
        // and later, flushPending will remove it from this.pendingSinks.
        return super.run(sink, scheduler);
    }
    dispose() {
        this._cancelTask();
        return super.dispose();
    }
    event(time, value) {
        this.flushPending(time);
        this.held = { value };
        super.event(time, value);
    }
    end(time) {
        this.flushPending(time);
        super.end(time);
    }
    error(time, err) {
        this.flushPending(time);
        super.error(time, err);
    }
    flushPending(time) {
        if (this.pendingSinks.length > 0 && this.held) {
            const pendingSinks = this.pendingSinks;
            this.pendingSinks = [];
            for (let i = 0; i < pendingSinks.length; ++i) {
                tryEvent(time, this.held.value, pendingSinks[i]);
            }
        }
    }
    _hasValue() {
        return this.held !== undefined;
    }
    _hasSinks() {
        return this.sinks.length > 0;
    }
    _shouldScheduleFlush() {
        return this._hasValue() && this._hasSinks();
    }
    _scheduleFlush(sink, scheduler) {
        this.pendingSinks.push(sink);
        if (this.task) {
            cancelTask(this.task);
        }
        this.task = asap(new HoldTask(this), scheduler);
    }
    _cancelTask() {
        if (this.task) {
            cancelTask(this.task);
            this.task = undefined;
        }
    }
}
class HoldTask {
    constructor(hold) {
        this.hold = hold;
    }
    run(t) {
        this.hold.flushPending(t);
    }
    error(t, e) {
        this.hold.error(t, e);
    }
    dispose() {
    }
}
function tryEvent(t, x, sink) {
    try {
        sink.event(t, x);
    }
    catch (e) {
        sink.error(t, e);
    }
}

export { hold };
//# sourceMappingURL=index.es.js.map
