// from mostjs/subject esnext tsconfig
import { curry2, id, curry3 } from './prelude.mjs';
import { MulticastSource, never } from './core.mjs';

const attach = curry2(__attach);
function __attach(sink, stream) {
    return sink.attach(stream);
}

class ProxyStream extends MulticastSource {
    constructor() {
        super(never());
        this.attached = false;
        this.running = false;
    }
    run(sink, scheduler) {
        this.scheduler = scheduler;
        this.add(sink);
        const shouldRun = this.attached && !this.running;
        if (shouldRun) {
            this.running = true;
            this.disposable = this.source.run(this, scheduler);
            return this.disposable;
        }
        return new ProxyDisposable(this, sink);
    }
    attach(stream) {
        if (this.attached)
            throw new Error('Can only attach 1 stream');
        this.attached = true;
        this.source = stream;
        const hasMoreSinks = this.sinks.length > 0;
        if (hasMoreSinks)
            this.disposable = stream.run(this, this.scheduler);
        return stream;
    }
    error(time, error) {
        this.cleanup();
        super.error(time, error);
    }
    end(time) {
        this.cleanup();
        super.end(time);
    }
    cleanup() {
        this.attached = false;
        this.running = false;
    }
}
class ProxyDisposable {
    constructor(source, sink) {
        this.source = source;
        this.sink = sink;
        this.disposed = false;
    }
    dispose() {
        if (this.disposed)
            return;
        const { source, sink } = this;
        this.disposed = true;
        const remainingSinks = source.remove(sink);
        const hasNoMoreSinks = remainingSinks === 0;
        return hasNoMoreSinks && source.dispose();
    }
}

function create(f = id) {
    const source = new ProxyStream();
    return [source, f(source)];
}

const end = curry2(__end);
function __end(time, sink) {
    sink.end(time);
}

const error = curry3(__error);
function __error(time, error, sink) {
    sink.error(time, error);
}

const event = curry3(__event);
function __event(time, value, sink) {
    sink.event(time, value);
}

export { attach, create, end, error, event };
//# sourceMappingURL=subject.mjs.map
