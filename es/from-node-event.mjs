/** @license MIT License (c) copyright 2018 original author or authors */
/** @author Sergey Samokhov */
import { currentTime } from './scheduler.mjs';
// fromEvent :: (Emitter emt, Event e) => String -> emt -> Stream e
const fromEvent = (event, emitter) => FromEvent(event, emitter, 'addListener');
const fromEventPrepended = (event, emitter) => FromEvent(event, emitter, 'prependListener');
function FromEvent(event, emitter, method) {
    return { run };
    function run(sink, scheduler) {
        emitter[method](event, send);
        return ListenerDisposable(emitter, event, send);
        function send(e) {
            tryEvent(currentTime(scheduler), e, sink);
        }
    }
}
function ListenerDisposable(emitter, event, send) {
    return {
        dispose: () => {
            emitter.removeListener(event, send);
        }
    };
}
function tryEvent(t, e, sink) {
    try {
        sink.event(t, e);
    }
    catch (error) {
        sink.error(t, error);
    }
}
export { fromEvent, fromEventPrepended, ListenerDisposable, };
//# sourceMappingURL=index.js.map