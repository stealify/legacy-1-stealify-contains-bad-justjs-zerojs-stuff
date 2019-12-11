import { asap } from './scheduler.mjs';
export class ArrayTask {
    constructor(array, sink) {
        this.array = array;
        this.sink = sink;
        this.active = true;
    }
    run(time) {
        const { array, sink } = this;
        const { length } = array;
        for (let i = 0; i < length && this.active; i++) {
            sink.event(time, array[i]);
        }
        this.active && sink.end(time);
    }
    error(t, e) {
        this.sink.error(t, e);
    }
    dispose() {
        this.active = false;
    }
}
// fromArray :: e[] -> Stream e
function fromArray(a) {
    return new FromArray(a);
}
class FromArray {
    constructor(a) {
        this.a = a;
    }
    run(sink, scheduler) {
        return asap(new ArrayTask(this.a, sink), scheduler);
    }
}
export { fromArray };