import { continueWith } from '@most/core';
import { currentTime } from '@most/scheduler';
import { disposeWith } from '@most/disposable';

const nextAnimationFrame = afp => new AnimationFrame(afp);

const animationFrames = afp => continueWith(() => animationFrames(afp), nextAnimationFrame(afp));

class AnimationFrame {

  constructor(afp) {
    this.afp = afp;
  }

  run(sink, scheduler$$1) {
    const propagate = timestamp => eventThenEnd(currentTime(scheduler$$1), timestamp, sink);
    const request = this.afp.requestAnimationFrame(propagate);
    return disposeWith(request => this.afp.cancelAnimationFrame(request), request);
  }
}

const eventThenEnd = (t, x, sink) => {
  sink.event(t, x);
  sink.end(t);
};

export { nextAnimationFrame, animationFrames };
//# sourceMappingURL=index.es.js.map
