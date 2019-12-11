API
===

@most/types
-----------

### Time

All time-related types use units defined by a Clock. The default
Scheduler Clock uses milliseconds as its units: Time,
Delay \<Delay-type\>, Period, and Offset will all be millisecond values.

``` {.sourceCode .haskell}
type Time = number
```

Time is a monotonic number. It represents the current time according to
a Clock. When using a default Scheduler \<newDefaultScheduler\>, the
units will be milliseconds.

#### Delay

``` {.sourceCode .haskell}
type Delay = number
```

A `Delay` represents a duration from "now". When using a default
Scheduler \<newDefaultScheduler\>, the units will be milliseconds.

#### Period

``` {.sourceCode .haskell}
type Period = number
```

A `Period` represents a regular interval. When using a default
Scheduler \<newDefaultScheduler\>, the units will be milliseconds.

#### Offset

``` {.sourceCode .haskell}
type Offset = number
```

An `Offset` represents the relationship of one Clock to another. When
using a default Scheduler \<newDefaultScheduler\>, the units will be
milliseconds.

**NOTE**: Typically, you will not need to be concerned with the Offset
type.

### Stream

``` {.sourceCode .haskell}
type Stream a = {
  run :: Sink a -> Scheduler -> Disposable
}
```

A `Stream` represents a view of events over time. Its `run` method
arranges events to be propagated to the provided Sink in the future.
Each `Stream` has a local clock, defined by the provided Scheduler,
which has methods for knowing the current time and scheduling future
Tasks \<Task\>.

A `Stream` may be simple, like now, or may do sophisticated things such
as combining \<combine\> multiple `Stream` s or deal with higher-order
`Stream` s.

A `Stream` may act as an event producer, such as a `Stream` that
produces DOM events. A producer `Stream` must never produce an event in
the same call stack as its `run` method is called. It must begin
producing items asynchronously. In some cases, this comes for free, such
as DOM events. In other cases, it must be done explicitly using the
provided Scheduler to schedule asynchronous Tasks \<Task\>.

### Sink

``` {.sourceCode .haskell}
type Sink a = {
  event :: Time -> a -> void
  error :: Time -> Error -> void
  end :: Time -> void
}
```

A `Sink` receives events—typically it does something with them, such as
transforming or filtering them—and then propagates them to another
`Sink`.

Typically, a combinator will be implemented as a Stream and a `Sink`.
The Stream is usually stateless/immutable and creates a new `Sink` for
each new observer. In most cases, the relationship of a Stream to `Sink`
is 1-many.

### Disposable

``` {.sourceCode .haskell}
type Disposable = {
  dispose:: () -> void
}
```

A `Disposable` represents a resource that must be disposed of (or
released), such as a DOM event listener.

### Scheduler

``` {.sourceCode .haskell}
type Scheduler = {
  currentTime :: () -> Time
  scheduleTask :: Offset -> Delay -> Period -> Task -> ScheduledTask
  relative :: Offset -> Scheduler
  cancel :: ScheduledTask -> void
  -- deprecated
  cancelAll :: (ScheduledTask -> boolean) -> void
}
```

A `Scheduler` provides the central notion of time for the
Streams \<Stream\> in an application.

An application will typically create a single "root" `Scheduler` so that
all Streams \<Stream\> share the same underlying time.

### Clock

``` {.sourceCode .haskell}
type Clock = {
  now :: () -> Time
}
```

A `Clock` represents a source of the current time. The default Clock
uses milliseconds as its units: Time, Delay-type, Period, and Offset
will all be millisecond values.

### Timer

``` {.sourceCode .haskell}
type Handle = any -- intentionally opaque handle

type Timer = {
  now :: () -> Time,
  setTimer :: (() -> any) -> Delay -> Handle,
  clearTimer :: Handle -> void
}
```

A `Timer` abstracts platform time, typically relying on a Clock, and
timer scheduling, typically using `setTimeout`.

### Timeline

``` {.sourceCode .haskell}
type TaskRunner = (ScheduledTask) -> any

type Timeline = {
  add :: ScheduledTask -> void,
  remove :: ScheduledTask -> boolean,
  -- deprecated
  removeAll :: (ScheduledTask) -> boolean) -> void,
  isEmpty :: () -> boolean,
  nextArrival :: () -> Time,
  runTasks :: Time -> TaskRunner -> void
}
```

A `Timeline` represents a set of ScheduledTasks \<ScheduledTask\> to be
executed at particular times.

### Task

``` {.sourceCode .haskell}
type Task = Disposable & {
  run :: Time -> void,
  error:: Time -> Error -> void
}
```

A `Task` is any unit of work that can be scheduled for execution with a
Scheduler.

### ScheduledTask

``` {.sourceCode .haskell}
type ScheduledTask = Disposable & {
  task :: Task,
  run :: () -> void,
  error :: Error -> void
}
```

A `ScheduledTask` represents a Task which has been scheduled in a
particular Scheduler. A `ScheduledTask`'s `dispose` method will cancel
the Task with the Scheduler with which it was scheduled.

@most/core
----------

### Running

#### runEffects

``` {.sourceCode .haskell}
runEffects :: Stream a -> Scheduler -> Promise void
```

Activate an event Stream and consume all its events.

#### run

> **attention**
>
> `@most/core` encourages a declarative approach. Combinators like until
> allow you to declare which events you're interested in, and
> `@most/core` will manage acquiring and disposing resources
> automatically. `run` is intended for use cases that cannot be handled
> declaratively, such as at integration points with other projects whose
> APIs may force an imperative approach.

``` {.sourceCode .haskell}
run :: Sink a -> Scheduler -> Stream a -> Disposable
```

Run a Stream, sending all events to the provided Sink. The Stream's Time
values come from the provided Scheduler. Returns a Disposable that can
be used to dispose underlying resources imperatively.

Declarative combinators like until still manage resources automatically
when using `run`. The returned Disposable simply provides an additional
way to trigger disposal manually.

### Construction

#### empty

``` {.sourceCode .haskell}
empty :: () -> Stream *
```

Create a Stream containing no events and ends immediately. :

    empty(): |

#### never

``` {.sourceCode .haskell}
never :: () -> Stream *
```

Create a Stream containing no events and never ends. :

    never(): ---->

#### now

``` {.sourceCode .haskell}
now :: a -> Stream a
```

Create a Stream containing a single event at time 0. :

    now(x): x|

#### at

``` {.sourceCode .haskell}
at :: Time -> a -> Stream a
```

Create a Stream containing a single event at a specific time. :

    at(3, x): --x|

#### periodic

``` {.sourceCode .haskell}
periodic :: Period -> Stream void
```

Create an infinite Stream containing events that occur at a specified
Period. The first event occurs at time 0, and the event values are
`undefined`. :

    periodic(3): x--x--x--x-->

#### throwError

``` {.sourceCode .haskell}
throwError :: Error -> Stream void
```

Create a Stream that fails with the provided `Error` at time 0. This can
be useful for functions that need to return a Stream and also need to
propagate an error. :

    throwError(X): X

### Extending

#### startWith

``` {.sourceCode .haskell}
startWith :: a -> Stream a -> Stream a
```

Prepend an event at time 0. :

    stream:               --a-b-c-d->
    startWith(x, stream): x-a-b-c-d->

Note that `startWith` *does not* delay other events. If `stream` already
contains an event at time 0, then `startWith` simply adds another event
at time 0—the two will be simultaneous, but ordered. For example:

    stream:                a-b-c-d->
    startWith(x, stream): xa-b-c-d->

Both `x` and `a` occur at time 0, but `x` will be observed before `a`.

#### continueWith

``` {.sourceCode .haskell}
continueWith :: (() -> Stream a) -> Stream a -> Stream a
```

Replace the end of a Stream with another Stream. :

    stream:                  -a-b-c-d|
    f():                               -1-2-3-4-5->
    continueWith(f, stream): -a-b-c-d-1-2-3-4-5->

When `stream` ends, `f` will be called and must return a Stream.

### Transformation

#### map

``` {.sourceCode .haskell}
map :: (a -> b) -> Stream a -> Stream b
```

Apply a function to each event value. :

    stream:         -a-b-c-d->
    map(f, stream): -f(a)-f(b)-f(c)-f(d)->

``` {.sourceCode .javascript}
map(x => x + 1, stream)
```

#### constant

``` {.sourceCode .haskell}
constant :: a -> Stream * -> Stream a
```

Replace each event value with `x`. :

    stream:              -a-b-c-d->
    constant(x, stream): -x-x-x-x->

``` {.sourceCode .javascript}
constant('tick', periodic(1000))
```

#### tap

``` {.sourceCode .haskell}
tap :: (a -> *) -> Stream a -> Stream a
```

Perform a side effect for each event in a Stream.

``` {.sourceCode .javascript}
stream:         -a-b-c-d->
tap(f, stream): -a-b-c-d->
```

For each event in `stream`, `f` is called, but the value of its result
is ignored. If `f` fails (i.e., throws an error), then the returned
Stream will also fail. The Stream returned by `tap` will contain the
same events as the original Stream.

#### ap

``` {.sourceCode .haskell}
ap :: Stream (a -> b) -> Stream a -> Stream b
```

Apply the latest function in a Stream of functions to the latest value
of another Stream.

``` {.sourceCode .javascript}
streamOfFunctions:              --f-----------g---------h--------->
stream:                         -a-------b---------c---------d---->
ap(streamOfFunctions, stream): --f(a)---f(b)-g(b)-g(c)-h(c)-h(d)->
```

In effect, `ap` applies a time-varying function to a time-varying value.

#### scan

``` {.sourceCode .haskell}
scan :: (b -> a -> b) -> b -> Stream a -> Stream b
```

Incrementally accumulate results, starting with the provided initial
value. :

    stream:                           -1-2-3->
    scan((x, y) => x + y, 0, stream): 01-3-6->

#### loop

``` {.sourceCode .haskell}
loop :: (b -> a -> { seed :: b, value :: c }) -> b -> Stream a -> Stream c
```

Accumulate results using a feedback loop that emits one value and feeds
back another to be used in the next iteration.

It allows you to maintain and update a "state" (a.k.a. feedback, a.k.a.
seed for the next iteration) while emitting a different value. In
contrast, scan feeds back and produces the same value.

``` {.sourceCode .javascript}
// Average an array of values.
const average = values =>
  values.reduce((sum, x) => sum + x, 0) / values.length

const stream = // ...

// Emit the simple (i.e., windowed) moving average of the 10 most recent values.
loop((values, x) => {
  values.push(x)
  values = values.slice(-10) // Keep up to 10 most recent
  const avg = average(values)

  // Return { seed, value } pair.
  // seed will feed back into next iteration.
  // value will be propagated.
  return { seed: values, value: avg }
}, [], stream)
```

#### zipItems

``` {.sourceCode .haskell}
zipItems :: ((a, b) -> c) -> [a] -> Stream b -> Stream c
```

Apply a function to the latest event and the array value at the
respective index. :

    array:                        [ 1, 2, 3 ]
    stream:                       --10---10---10---10---10--->
    zipItems(add, array, stream): --11---12---13|

The resulting Stream will contain the same number of events as the input
Stream, or `array.length` events, whichever is less.

#### withItems

``` {.sourceCode .haskell}
withItems :: [a] -> Stream b -> Stream a
```

Replace each event value with the array item at the respective index. :

    array:                    [ 1, 2, 3 ]
    stream:                   --x--x--x--x--x-->
    withItems(array, stream): --1--2--3|

The resulting Stream will contain the same number of events as the input
Stream, or `array.length` events, whichever is less.

### Flattening

#### switchLatest

``` {.sourceCode .haskell}
switchLatest :: Stream (Stream a) -> Stream a
```

Given a higher-order Stream, return a new Stream that adopts the
behavior of (i.e., emits the events of) the most recent inner Stream. :

    s:                    -a-b-c-d-e-f->
    t:                    -1-2-3-4-5-6->
    stream:               -s-----t----->
    switchLatest(stream): -a-b-c-4-5-6->

#### join

``` {.sourceCode .haskell}
join :: Stream (Stream a) -> Stream a
```

Given a higher-order Stream, return a new Stream that merges all the
inner Streams \<Stream\> as they arrive. :

    s:             ---a---b---c---d-->
    t:             -1--2--3--4--5--6->
    stream:        -s------t--------->
    join(stream):  ---a---b--4c-5-d6->

#### chain

``` {.sourceCode .haskell}
chain :: (a -> Stream b) -> Stream a -> Stream b
```

Transform each event in `stream` into a new Stream, and then merge each
into the resulting Stream. Note that `f` must return a Stream. :

    stream:            -a----b----c|
    f(a):               1--2--3|
    f(b):                    1----2----3|
    f(c):                           1-2-3|
    chain(f, stream):  -1--2-13---2-1-233|

#### concatMap

``` {.sourceCode .haskell}
concatMap :: (a -> Stream b) -> Stream a -> Stream b
```

Transform each event in `stream` into a Stream, and then concatenate
each onto the end of the resulting Stream. Note that `f` must return a
Stream.

The mapping function `f` is applied lazily. That is, `f` is called only
once it is time to concatenate a new stream. :

    stream:                -a----b----c|
    f(a):                   1--2--3|
    f(b):                        1----2----3|
    f(c):                               1-2-3|
    concatMap(f, stream):  -1--2--31----2----31-2-3|
    f called lazily:        ^      ^          ^

Note the difference between `concatMap` and ref:\`chain\`: `concatMap`
concatenates, while ref:chain merges.

#### mergeConcurrently

``` {.sourceCode .haskell}
mergeConcurrently :: int -> Stream (Stream a) -> Stream a
```

Given a higher-order Stream, return a new Stream that merges inner
Streams \<Stream\> as they arrive up to the specified concurrency. Once
concurrency number of Streams \<Stream\> are being merged, newly
arriving Streams \<Stream\> will be merged after an existing one ends. :

    s:                            --a--b--c--d--e-->
    t:                            --x------y|
    u:                            -1--2--3--4--5--6>
    stream:                       -s--t--u--------->
    mergeConcurrently(2, stream): --a--b--cy4d-5e-6>

Note that `u` is only merged after `t` ends because of the concurrency
level of 2.

Note also that `mergeConcurrently(Infinity, stream)` is equivalent to
`join(stream)`.

To control concurrency, `mergeConcurrently` must maintain an internal
queue of newly arrived Streams \<Stream\>. If new Streams \<Stream\>
arrive faster than the concurrency level allows them to be merged, the
internal queue will grow infinitely.

#### mergeMapConcurrently

``` {.sourceCode .haskell}
mergeMapConcurrently :: (a -> Stream b) -> int -> Stream a -> Stream b
```

Lazily apply a function `f` to each event in a Stream, merging them into
the resulting Stream at the specified concurrency. Once concurrency
number of Streams \<Stream\> are being merged, newly arriving
Streams \<Stream\> will be merged after an existing one ends. :

    stream:                             --ab--c----d----->
    f(a):                               -1-2-3|
    f(b):                               -4-5-6----------->
    f(c):                               -7--------------->
    f(d):                               -1-2-3-4-5-6-7-8->
    mergeMapConcurently(f, 2, stream) : ---142536-7------>

Note that `f(c)` is only merged after `f(a)` ends.

Also note that `f` will not get called with `d` until either `f(b)` or
`f(c)` ends.

To control concurrency, `mergeMapConcurrently` must maintain an internal
queue of newly arrived Streams \<Stream\>. If new Streams \<Stream\>
arrive faster than the concurrency level allows them to be merged, the
internal queue will grow infinitely.

### Merging

#### merge

``` {.sourceCode .haskell}
merge :: Stream a -> Stream b -> Stream (a | b)
```

Create a new Stream containing events from two Streams \<Stream\>. :

    s1:            -a--b----c--->
    s2:            --w---x-y--z->
    merge(s1, s2): -aw-b-x-yc-z->

Merging creates a new Stream containing all events from the two original
Streams \<Stream\> without affecting the time of the events. You can
think of the events from the input Streams \<Stream\> simply being
interleaved into the new, merged Stream. A merged Stream ends when all
of its input Streams \<Stream\> have ended.

#### mergeArray

``` {.sourceCode .haskell}
mergeArray :: [ Stream a, Stream b, ... ] -> Stream (a | b | ...)
```

Array form of merge. Create a new Stream containing all events from all
Streams \<Stream\> in the array. :

    s1:                       -a--b----c---->
    s2:                       --w---x-y--z-->
    s3:                       ---1---2----3->
    mergeArray([s1, s2, s3]): -aw1b-x2yc-z3->

#### combine

``` {.sourceCode .haskell}
combine :: (a -> b -> c) -> Stream a -> Stream b -> Stream c
```

Apply a function to the most recent event from each Stream when a new
event arrives on any Stream. :

    s1:                   -0--1----2--->
    s2:                   --3---4-5--6->
    combine(add, s1, s2): --3-4-5-67-8->

Note that `combine` waits for at least one event to arrive on all input
Streams \<Stream\> before it produces any events.

#### combineArray

``` {.sourceCode .haskell}
combineArray :: ((a, b, ...) -> z) -> [ Stream a, Stream b, ... ] -> Stream z
```

Array form of combine. Apply a function to the most recent event from
all Streams \<Stream\> when a new event arrives on any Stream. :

    s1:                               -0--1----2->
    s2:                               --3---4-5-->
    s3:                               ---2---1--->
    combineArray(add3, [s1, s2, s3]): ---56-7678->

#### zip

``` {.sourceCode .haskell}
zip :: (a -> b -> c) -> Stream a -> Stream b -> Stream c
```

Apply a function to corresponding pairs of events from the inputs
Streams \<Stream\>. :

    s1:               -1--2--3--4->
    s2:               -1---2---3---4->
    zip(add, s1, s2): -2---4---6---8->

Zipping correlates by *index*-corresponding events from two input
streams. Note that zipping a "fast" Stream and a "slow" Stream will
cause buffering. Events from the fast Stream must be buffered in memory
until an event at the corresponding index arrives on the slow Stream.

A zipped Stream ends when any one of its input Streams \<Stream\> ends.

#### zipArray

``` {.sourceCode .haskell}
zipArray :: ((a, b, ...) -> z) -> [ Stream a, Stream b, ... ] -> Stream z
```

Array form of zip. Apply a function to corresponding events from all the
inputs Streams \<Stream\>. :

    s1:                           -1-2-3---->
    s2:                           -1--2--3-->
    s3:                           --1--2--3->
    zipArray(add3, [s1, s2, s3]): --3--6--9->

\_sample

#### sample

``` {.sourceCode .haskell}
sample :: Stream a -> Stream b -> Stream a
```

For each event in a sampler Stream, replace the event value with the
latest value in another Stream. The resulting Stream will contain the
same number of events as the sampler Stream. :

    values:                  -1--2--3--4--5->
    sampler:                 -1-----2-----3->
    sample(values, sampler): -1-----3-----5->

    values:                  -1-----2-----3->
    sampler:                 -1--2--3--4--5->
    sample(values, sampler): -1--1--2--2--3->

#### snapshot

``` {.sourceCode .haskell}
snapshot :: ((a, b) -> c) -> Stream a -> Stream b -> Stream c
```

For each event in a sampler Stream, apply a function to combine its
value with the most recent event value in another Stream. The resulting
Stream will contain the same number of events as the sampler Stream. :

    values:                         -1--2--3--4--5->
    sampler:                        -1-----2-----3->
    snapshot(sum, values, sampler): -2-----5-----8->

    values:                         -1-----2-----3->
    sampler:                        -1--2--3--4--5->
    snapshot(sum, values, sampler): -2--3--5--6--8->

In contrast to combine, `snapshot` produces a value only when an event
arrives on the sampler.

### Filtering

#### filter

``` {.sourceCode .haskell}
filter :: (a -> bool) -> Stream a -> Stream a
```

Retain only events for which a predicate is truthy. :

    stream:               -1-2-3-4->
    filter(even, stream): ---2---4->

#### skipRepeats

``` {.sourceCode .haskell}
skipRepeats :: Stream a -> Stream a
```

Remove adjacent repeated events. :

    stream:              -1-2-2-3-4-4-5->
    skipRepeats(stream): -1-2---3-4---5->

Note that `===` is used to identify repeated items. To use a different
comparison, use skipRepeatsWith.

#### skipRepeatsWith

``` {.sourceCode .haskell}
skipRepeatsWith :: ((a, a) -> bool) -> Stream a -> Stream a
```

Remove adjacent repeated events, using the provided equality function to
compare adjacent events. :

    stream:                                    -a-b-B-c-D-d-e->
    skipRepeatsWith(equalsIgnoreCase, stream): -a-b---c-D---e->

The equals function should return `true` if the two values are equal, or
`false` if they are not equal.

### Slicing

#### slice

``` {.sourceCode .haskell}
slice :: int -> int -> Stream a -> Stream a
```

Keep only events in a range, where *start \<= index \< end*, and *index*
is the ordinal index of an event in `stream`. :

    stream:              -a-b-c-d-e-f->
    slice(1, 4, stream): ---b-c-d|

    stream:              -a-b-c|
    slice(1, 4, stream): ---b-c|

If `stream` contains fewer than *start* events, the returned Stream will
be empty.

#### take

``` {.sourceCode .haskell}
take :: int -> Stream a -> Stream a
```

Keep at most the first *n* events from `stream`. :

    stream:          -a-b-c-d-e-f->
    take(3, stream): -a-b-c|

    stream:          -a-b|
    take(3, stream): -a-b|

If `stream` contains fewer than *n* events, the returned Stream will
effectively be equivalent to `stream`.

#### skip

``` {.sourceCode .haskell}
skip :: int -> Stream a -> Stream a
```

Discard the first *n* events from `stream`. :

    stream:          -a-b-c-d-e-f->
    skip(3, stream): -------d-e-f->

    stream:          -a-b-c-d-e|
    skip(3, stream): -------d-e|

    stream:          -a-b-c|
    skip(3, stream): ------|

If `stream` contains fewer than *n* events, the returned Stream will be
empty.

#### takeWhile

``` {.sourceCode .haskell}
takeWhile :: (a -> bool) -> Stream a -> Stream a
```

Keep all events until predicate returns `false`, and discard the rest. :

    stream:                  -2-4-5-6-8->
    takeWhile(even, stream): -2-4-|

#### skipWhile

``` {.sourceCode .haskell}
skipWhile :: (a -> bool) -> Stream a -> Stream a
```

Discard all events until predicate returns `false`, and keep the rest. :

    stream:                  -2-4-5-6-8->
    skipWhile(even, stream): -----5-6-8->

#### skipAfter

``` {.sourceCode .haskell}
skipAfter :: (a -> bool) -> Stream a -> Stream a
```

Discard all events after the first event for which predicate returns
`true`. :

    stream:                  -1-2-3-4-5-6-8->
    skipAfter(even, stream): -1-2|

#### until

``` {.sourceCode .haskell}
until :: Stream * -> Stream a -> Stream a
```

Keep all events in one Stream until the first event occurs in another. :

    stream:                   -a-b-c-d-e-f->
    endSignal:                ------z->
    until(endSignal, stream): -a-b-c|

Note that if `endSignal` has no events, then the returned Stream will
effectively be equivalent to the original.

``` {.sourceCode .javascript}
// Keep only 3 seconds of events, discard the rest.
until(at(3000, null), stream)
```

#### since

``` {.sourceCode .haskell}
since :: Stream * -> Stream a -> Stream a
```

Discard all events in one Stream until the first event occurs in
another. :

    stream:                     -a-b-c-d-e-f->
    startSignal:                ------z->
    since(startSignal, stream): -------d-e-f->

Note that if `startSignal` has no events, then the returned Stream will
effectively be equivalent to never.

``` {.sourceCode .javascript}
// Discard events for 3 seconds, keep the rest.
since(at(3000, null), stream)
```

#### during

``` {.sourceCode .haskell}
during :: Stream (Stream *) -> Stream a -> Stream a
```

Keep events that occur during a time window defined by a higher-order
Stream. :

    stream:                     -a-b-c-d-e-f-g->
    timeWindow:                 -----s
    s:                                -----x
    during(timeWindow, stream): -----c-d-e-|

This is similar to slice, but uses time rather than indices to "slice"
the Stream.

``` {.sourceCode .javascript}
// A time window that:
// 1. starts at time = 1 second
// 2. ends at time = 6 seconds (1 second + 5 seconds).
const timeWindow = at(1000, at(5000, null))

// 1. Discard events for 1 second, then
// 2. keep events for 5 more seconds, then
// 3. discard all subsequent events.
during(timeWindow, stream)
```

#### Dealing with time

#### delay

``` {.sourceCode .haskell}
delay :: Delay -> Stream a -> Stream a
```

Timeshift a Stream by the specified Delay \<Delay-type\>. :

    stream:           -a-b-c-d->
    delay(1, stream): --a-b-c-d->
    delay(5, stream): ------a-b-c-d->

Delaying a Stream timeshifts all the events by the same amount. It
doesn't change the time *between* events.

#### withLocalTime

``` {.sourceCode .haskell}
withLocalTime :: Time -> Stream a -> Stream a
```

Create a Stream with localized Time values, whose origin (i.e., time 0)
is at the specified Time on the Scheduler provided when the Stream is
observed with runEffects or run.

When implementing custom higher-order Stream combinators, such as chain,
you should use `withLocalTime` to localize "inner" Streams before
running them.

#### Rate limiting

#### throttle

``` {.sourceCode .haskell}
throttle :: int -> Stream a -> Stream a
```

Limit the rate of events to at most one per *n* milliseconds. :

    stream:               abcd----abcd---->
    throttle(2, stream):  a-c-----a-c----->

In contrast to debounce, `throttle` simply drops events that occur "too
often", whereas debounce waits for a "quiet period".

#### debounce

``` {.sourceCode .haskell}
debounce :: int -> Stream a -> Stream a
```

Wait for a burst of events to subside and keep only the last event in
the burst. :

    stream:              abcd----abcd---->
    debounce(2, stream): -----d-------d-->

If the Stream ends while there is a pending debounced event (e.g., via
until), the pending event will occur just before the Stream ends. For
example:

    s1:                         abcd----abcd---->
    s2:                         ------------|
    debounce(2, until(s2, s1)): -----d------d|

Debouncing can be extremely useful when dealing with bursts of similar
events. For example, debouncing keypress events before initiating a
remote search query in a browser application.

``` {.sourceCode .javascript}
const searchInput = document.querySelector('[name="search-text"]');
const searchText = most.fromEvent('input', searchInput);

// The current value of the searchInput, but only
// after the user stops typing for 500 milliseconds.
map(e => e.target.value, debounce(500, searchText))
```

### Dealing with Promises

#### fromPromise

``` {.sourceCode .haskell}
fromPromise :: Promise a -> Stream a
```

Create a Stream containing a promise's value. :

    promise:              ----a
    fromPromise(promise): ----a|

If the promise rejects, the Stream will be in an error state with the
promise's rejection reason as its error. See recoverWith for error
recovery.

#### awaitPromises

``` {.sourceCode .haskell}
awaitPromises :: Stream (Promise a) -> Stream a
```

Turn a Stream of promises into a Stream containing the promises' values.
:

    promise p:             ---1
    promise q:             ------2
    promise r:             -3
    stream:                -p---q---r->
    awaitPromises(stream): ---1--2--3->

Note that event order is always preserved, regardless of promise
fulfillment order.

**Using fulfillment order**

To create a Stream that merges promises in fulfillment order, use
`chain(fromPromise, stream)`. Note the difference:

    promise p:                    --1
    promise q:                    --------2
    promise r:                    ------3
    stream:                       -p-q-r----->
    chain(fromPromise, stream):   --1---3-2-->
    awaitPromises(stream):        --1-----23->

**Rejected promises**

If a promise rejects, the Stream will be in an error state with the
rejected promise's reason as its error. See recoverWith for error
recovery. For example:

    promise p:             ---1
    promise q:             ------X
    promise r:             -3
    stream:                -p---q---r->
    awaitPromises(stream): ---1--X

**Forever pending promises**

If a promise remains pending forever, the Stream will never produce any
events beyond that promise. Use a promise timeout or race in such cases
to ensure that all promises either fulfill or reject. For example:

    promise p:             ---1
    promise q:             ----------->
    promise r:             -3
    stream:                -p---q---r->
    awaitPromises(stream): ---1------->

### Handling Errors

#### recoverWith

``` {.sourceCode .haskell}
recoverWith :: (Error -> Stream a) -> Stream a -> Stream a
```

Recover from a stream failure by calling a function to create a new
Stream. :

    s:                 -a-b-c-X
    f(X):                     d-e-f->
    recoverWith(f, s): -a-b-c-d-e-f->

When `s` fails with an error, `f` will be called with the error. `f`
must return a new Stream to replace the error.

### Sharing Streams

#### multicast

``` {.sourceCode .haskell}
multicast :: Stream a -> Stream a
```

Returns a Stream equivalent to the original but which can be shared more
efficiently among multiple consumers. :

    stream:             -a-b-c-d->
    multicast(stream):  -a-b-c-d->

Multicast allows you to build up a stream of maps, filters, and other
transformations, and then share it efficiently with multiple observers.

### Tasks

Helper functions for creating Tasks \<Task\> to propagate events.

#### propagateTask

``` {.sourceCode .haskell}
propagateTask :: (Time -> a -> Sink a -> *) -> a -> Sink a -> Task
```

Create a Task to propagate a value to a Sink. When the Task executes,
the provided function will receive the current time (from the Scheduler
with which it was scheduled) and the provided value and Sink. The Task
can use the Sink to propagate the value in whatever way it chooses. For
example as an event or an error, or it could choose not to propagate the
event based on some condition, etc.

#### propagateEventTask

``` {.sourceCode .haskell}
propagateEventTask :: a -> Sink a -> Task
```

Create a Task that can be scheduled to propagate an event value to a
Sink. When the task executes, it will call the Sink's `event` method
with the current time (from the Scheduler with which it was scheduled)
and the value.

#### propagateEndTask

``` {.sourceCode .haskell}
propagateEndTask :: Sink * -> Task
```

Create a Task that can be scheduled to propagate end to a Sink. When the
task executes, it will call the Sink's `end` method with the current
time (from the Scheduler with which it was scheduled).

#### propagateErrorTask

``` {.sourceCode .haskell}
propagateErrorTask :: Error -> Sink * -> Task
```

Create a Task that can be scheduled to propagate an error to a Sink.
When the Task executes, it will call the Sink's `error` method with the
current time (from the Scheduler with which it was scheduled) and the
error.

@most/scheduler
---------------

### Reading Current Time

#### currentTime

``` {.sourceCode .haskell}
currentTime :: Scheduler -> Time
```

Read the current Time from a Scheduler.

### Scheduling Tasks

#### asap

``` {.sourceCode .haskell}
asap :: Task -> Scheduler -> ScheduledTask
```

Schedule a Task to execute as soon as possible, but still
asynchronously.

#### delay

``` {.sourceCode .haskell}
delay :: Delay -> Task -> Scheduler -> ScheduledTask
```

Schedule a Task to execute after a specified Delay \<Delay-type\>.

#### periodic

``` {.sourceCode .haskell}
periodic :: Period -> Task -> Scheduler -> ScheduledTask
```

Schedule a Task to execute periodically with the specified Period.

### Canceling Tasks

#### cancelTask

``` {.sourceCode .haskell}
cancelTask :: ScheduledTask -> void
```

Cancel all future scheduled executions of a ScheduledTask.

#### cancelAllTasks

> **warning**
>
> **Deprecated**: Will be removed in 2.0.0. Instead of using
> cancelAllTasks, Scheduler callers should track the tasks they create
> (e.g. by storing them in an array or other data structure), and then
> cancel each explicitly using cancelTask.

``` {.sourceCode .haskell}
cancelAllTasks :: (ScheduledTask -> boolean) -> Scheduler -> void
```

Cancel all future scheduled executions of all
ScheduledTasks \<ScheduledTask\> for which the provided predicate is
`true`.

### Creating a Scheduler

#### newScheduler

``` {.sourceCode .haskell}
newScheduler :: Timer -> Timeline -> Scheduler
```

Create a new Scheduler that uses the provided Timer and Timeline for
scheduling Tasks \<Task\>.

#### newDefaultScheduler

``` {.sourceCode .haskell}
newDefaultScheduler :: () -> Scheduler
```

Create a new Scheduler that uses a default platform-specific Timer and a
new, empty Timeline.

#### schedulerRelativeTo

``` {.sourceCode .haskell}
schedulerRelativeTo :: Offset -> Scheduler -> Scheduler
```

Create a new Scheduler with origin (i.e., zero time) at the specified
Offset with the provided Scheduler.

When implementing higher-order Stream combinators, this function can be
used to create a Scheduler with local time for each "inner" Stream.

``` {.sourceCode .javascript}
currentTime(scheduler) //> 1637
const relativeScheduler = schedulerRelativeTo(1234, scheduler)
currentTime(relativeScheduler) //> 0

// ... later ...

currentTime(scheduler) //> 3929
currentTime(relativeScheduler) //> 2292
```

### Timer, Timeline, and Clock

#### newClockTimer

``` {.sourceCode .haskell}
newClockTimer :: Clock -> Timer
```

Create a new Timer that uses the provided Clock as a source of the
current Time.

#### newTimeline

``` {.sourceCode .haskell}
newTimeline :: () -> Timeline
```

Create an empty Timeline.

#### newPlatformClock

``` {.sourceCode .haskell}
newPlatformClock :: () -> Clock
```

Create a new Clock by auto detecting the best platform-specific source
of Time. In modern browsers, it uses `performance.now`, and on Node,
`process.hrtime`. If neither is available, it falls back to `Date.now`.

#### newPerformanceClock

``` {.sourceCode .haskell}
newPerformanceClock :: () -> Clock
```

Create a new Clock using `performance.now`.

#### newHRTimeClock

``` {.sourceCode .haskell}
newHRTimeClock :: () -> Clock
```

Create a new Clock using `process.hrtime`.

#### newDateClock

> **warning**
>
> **Deprecated**: Will be removed in 2.0.0. `Date.now` is not monotonic,
> and has only been supported as a fallback for browsers that don't
> support `performance.now`.

``` {.sourceCode .haskell}
newDateClock :: () -> Clock
```

Create a new Clock using `Date.now`. Note that a Clock using `Date.now`
is not guaranteed to be monotonic and is subject to system clock
changes, e.g., NTP can change your system clock.

#### clockRelativeTo

``` {.sourceCode .haskell}
clockRelativeTo :: Clock -> Clock
```

Create a new Clock whose origin is at the *current time* (at the instant
of calling `clockRelativeTime`) of the provided Clock.

@most/disposable
----------------

### Creating Disposables

#### disposeNone

``` {.sourceCode .haskell}
disposeNone :: () -> Disposable
```

Create a no-op Disposable.

#### disposeWith

``` {.sourceCode .haskell}
disposeWith :: (a -> void) -> a -> Disposable
```

Create a Disposable which, when disposed of, will call the provided
function, passing the provided value.

#### disposeOnce

``` {.sourceCode .haskell}
disposeOnce :: Disposable -> Disposable
```

Wrap a Disposable so the underlying Disposable will only be disposed of
once—even if the returned Disposable is disposed of multiple times.

#### disposeBoth

``` {.sourceCode .haskell}
disposeBoth :: Disposable -> Disposable -> Disposable
```

Combine two Disposables \<Disposable\> into a single Disposable which
will dispose of both.

#### disposeAll

``` {.sourceCode .haskell}
disposeAll :: [Disposable] -> Disposable
```

Combine an array of Disposables \<Disposable\> into a single Disposable
which will dispose of all the Disposables \<Disposable\> in the array.

### Disposing Disposables

#### dispose

``` {.sourceCode .haskell}
dispose :: Disposable -> void
```

Dispose of the provided Disposable. Note that `dispose` does not catch
exceptions. If the Disposable throws an exception, the exception will
propagate out of `dispose`.

#### tryDispose

``` {.sourceCode .haskell}
tryDispose :: Time -> Disposable -> Sink * -> void
```

Attempt to dispose of the provided Disposable. If the Disposable throws
an exception, catch and propagate it to the provided Sink with the
provided Time.

Note: Only an exception thrown by the Disposable will be caught. If the
act of propagating an error to the Sink throws an exception, that
exception *will not* be caught.
