/**
 a stream has run(sink,scheduler) 
 a task has run(){}
 a task can have dispose() and a Stream can have dispose.
 a scheduler has .cancel he executes tasks
 a sink has event(time,value)
 
 */




/**
 * event Description of the function
 * @param {number} time Description
 * @param {Object} value Description
*/
const event = (time,value) => {};


 /**
 * Description of the function
 * @param {sink} sink Description
 * @param {scheduler} scheduler Description
*/
const run = (sink,scheduler) => {};

/**
 * @typedef sink
 * @property {event} event - ok
 * @property {scheduler} scheduler
 */

/**
 * Sinks are { run() {} || run(sink,scheduler) {}} and scheduler
 * @param {sink[]} sinks 
 * @param value 
 * @returns 
 */
const broadcast = (sinks, value) => sinks.slice().forEach(({ sink, scheduler }) => tryEvent(scheduler.currentTime(), value, sink));

/**
 * @typedef fanoutPortStream
 * @param {Object[]} sinks 
 * @returns {fanoutPortStream} fanoutPortStream
 */
const newFanoutPortStream = sinks => {
    const fanoutPortStream = {
        sinks,
        run(sink, scheduler) {
            const { sinks } = fanoutPortStream;
            const s = { sink, scheduler };
            sinks.push(s);
            return new RemovePortDisposable(s, sinks);
        }
    }
    return fanoutPortStream;
}

const newCreateAdapter = () => {
    const sinks = [];
    return [ value => broadcast(sinks, value), newFanoutPortStream(sinks) ];
};


const createAdapter = () => {
    const sinks = [];
    return [a => broadcast(sinks, a), new FanoutPortStream(sinks)];
};
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

const newRemovePortDisposable = (sink, sinks) => {
    const removePortDisposable = {
        sink, sinks,
        dispose() {
            const { sink, sinks } = removePortDisposable;
            const i = sinks.indexOf(sink);
            if (i >= 0) {
                sinks.splice(i, 1);
            }
        }
    }
    return removePortDisposable;
}


const tryEvent = (t, a, sink) => {
    try {
        sink.event(t, a);
    }
    catch (e) {
        sink.error(t, e);
    }
}

export { FanoutPortStream, RemovePortDisposable, createAdapter };