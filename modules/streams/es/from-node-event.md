# most from-event
Node-compatible events for [mostjs v2](https://github.com/mostjs/). For instance,

```js
import { fromEvent } from 'most-from-event';

const watcher = fs.watch('./tmp');

const stream = fromEvent(watcher, 'change');
```

### Install

```sh
npm install --save most-from-event
```

## API

### fromEvent

#### fromEvent :: (Emitter emt, Event e) => String -> emt -> Stream e

Given an event emitter, return a stream of events:

```js
const stream = fromEvent(eventName, emitter);
```

### fromEventPrepended

#### fromEventPrepended :: (Emitter emt, Event e) => String -> emt -> Stream e

Same as above, but adds the stream gets the events first (uses [`prependListener`](https://nodejs.org/api/events.html#events_emitter_prependlistener_eventname_listener)).