const createAdapter = () => {
    const sinks = [];
    return [a => broadcast(sinks, a), new FanoutPortStream(sinks)];
};
const broadcast = (sinks, a) => sinks.slice().forEach(({ sink, scheduler }) => tryEvent(scheduler.currentTime(), a, sink));
class FanoutPortStream {
    constructor(sinks) {
        this.sinks = sinks;
    }
    run(sink, scheduler) {
        const s = { sink, scheduler };
        this.sinks.push(s);
        return new RemovePortDisposable(s, this.sinks);
    }
}
class RemovePortDisposable {
    constructor(sink, sinks) {
        this.sink = sink;
        this.sinks = sinks;
    }
    dispose() {
        const i = this.sinks.indexOf(this.sink);
        if (i >= 0) {
            this.sinks.splice(i, 1);
        }
    }
}
function tryEvent(t, a, sink) {
    try {
        sink.event(t, a);
    }
    catch (e) {
        sink.error(t, e);
    }
}

export { FanoutPortStream, RemovePortDisposable, createAdapter };