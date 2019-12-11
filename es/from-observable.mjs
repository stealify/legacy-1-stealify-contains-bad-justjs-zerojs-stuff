import observableSymbol from "./symbol-observable.mjs";
import { currentTime } from "./scheduler";

const fromObservable = observable => new Observable(observable);

const tryEvent = (t, x, sink) => {
  try {
    sink.event(t, x);
  } catch (e) {
    sink.error(t, e);
  }
};

const getObservable = o => {
  if (o) {
    const method = o[observableSymbol];
    if (typeof method === "function") {
      const obs = method.call(o);
      if (!(obs && typeof obs.subscribe === "function")) {
        throw new TypeError("invalid observable " + obs);
      }
      return obs;
    }
  }
};

class Observable {
  constructor(observable) {
    this.observable = observable;
  }

  run(sink, scheduler) {
    const send = e => tryEvent(currentTime(scheduler), e, sink);

    const subscription = getObservable(this.observable).subscribe({
      next: send,
      error: e => sink.error(currentTime(scheduler), e),
      complete: () => sink.end(currentTime(scheduler))
    });

    const dispose = () => subscription.unsubscribe();

    return { dispose };
  }
}

export default fromObservable;
