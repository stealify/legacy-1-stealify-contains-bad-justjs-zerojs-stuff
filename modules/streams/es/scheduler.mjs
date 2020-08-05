//export * from '@most/scheduler/dist/index.es.js' esnext tsconfig
import { findIndex, removeAll, curry2, curry3 } from './prelude.mjs';

class ScheduledTaskImpl {
    constructor(time, localOffset, period, task, scheduler) {
        this.time = time;
        this.localOffset = localOffset;
        this.period = period;
        this.task = task;
        this.scheduler = scheduler;
        this.active = true;
    }
    run() {
        return this.task.run(this.time - this.localOffset);
    }
    error(e) {
        return this.task.error(this.time - this.localOffset, e);
    }
    dispose() {
        this.active = false;
        this.scheduler.cancel(this);
        return this.task.dispose();
    }
}

class RelativeScheduler {
    constructor(origin, scheduler) {
        this.origin = origin;
        this.scheduler = scheduler;
    }
    currentTime() {
        return this.scheduler.currentTime() - this.origin;
    }
    scheduleTask(localOffset, delay, period, task) {
        return this.scheduler.scheduleTask(localOffset + this.origin, delay, period, task);
    }
    relative(origin) {
        return new RelativeScheduler(origin + this.origin, this.scheduler);
    }
    cancel(task) {
        return this.scheduler.cancel(task);
    }
    cancelAll(f) {
        return this.scheduler.cancelAll(f);
    }
}

/** @license MIT License (c) copyright 2010-2017 original author or authors */
const defer = (task) => Promise.resolve(task).then(runTask);
function runTask(task) {
    try {
        return task.run();
    }
    catch (e) {
        return task.error(e);
    }
}

/** @license MIT License (c) copyright 2010-2017 original author or authors */
class SchedulerImpl {
    constructor(timer, timeline) {
        this._runReadyTasksBound = () => this._runReadyTasks();
        this.timer = timer;
        this.timeline = timeline;
        this._timer = null;
        this._nextArrival = Infinity;
    }
    currentTime() {
        return this.timer.now();
    }
    scheduleTask(localOffset, delay, period, task) {
        const time = this.currentTime() + Math.max(0, delay);
        const st = new ScheduledTaskImpl(time, localOffset, period, task, this);
        this.timeline.add(st);
        this._scheduleNextRun();
        return st;
    }
    relative(offset) {
        return new RelativeScheduler(offset, this);
    }
    cancel(task) {
        task.active = false;
        if (this.timeline.remove(task)) {
            this._reschedule();
        }
    }
    // @deprecated
    cancelAll(f) {
        this.timeline.removeAll(f);
        this._reschedule();
    }
    _reschedule() {
        if (this.timeline.isEmpty()) {
            this._unschedule();
        }
        else {
            this._scheduleNextRun();
        }
    }
    _unschedule() {
        this.timer.clearTimer(this._timer);
        this._timer = null;
    }
    _scheduleNextRun() {
        if (this.timeline.isEmpty()) {
            return;
        }
        const nextArrival = this.timeline.nextArrival();
        if (this._timer === null) {
            this._scheduleNextArrival(nextArrival);
        }
        else if (nextArrival < this._nextArrival) {
            this._unschedule();
            this._scheduleNextArrival(nextArrival);
        }
    }
    _scheduleNextArrival(nextArrival) {
        this._nextArrival = nextArrival;
        const delay = Math.max(0, nextArrival - this.currentTime());
        this._timer = this.timer.setTimer(this._runReadyTasksBound, delay);
    }
    _runReadyTasks() {
        this._timer = null;
        this.timeline.runTasks(this.currentTime(), runTask);
        this._scheduleNextRun();
    }
}

/** @license MIT License (c) copyright 2010-2017 original author or authors */
class TimelineImpl {
    constructor() {
        this.tasks = [];
    }
    nextArrival() {
        return this.isEmpty() ? Infinity : this.tasks[0].time;
    }
    isEmpty() {
        return this.tasks.length === 0;
    }
    add(st) {
        insertByTime(st, this.tasks);
    }
    remove(st) {
        const i = binarySearch(getTime(st), this.tasks);
        if (i >= 0 && i < this.tasks.length) {
            const events = this.tasks[i].events;
            const at = findIndex(st, events);
            if (at >= 0) {
                events.splice(at, 1);
                if (events.length === 0) {
                    this.tasks.splice(i, 1);
                }
                return true;
            }
        }
        return false;
    }
    /**
     * @deprecated
     */
    removeAll(f) {
        for (let i = 0; i < this.tasks.length; ++i) {
            removeAllFrom(f, this.tasks[i]);
        }
    }
    runTasks(t, runTask) {
        const tasks = this.tasks;
        const l = tasks.length;
        let i = 0;
        while (i < l && tasks[i].time <= t) {
            ++i;
        }
        this.tasks = tasks.slice(i);
        // Run all ready tasks
        for (let j = 0; j < i; ++j) {
            this.tasks = runReadyTasks(runTask, tasks[j].events, this.tasks);
        }
    }
}
function runReadyTasks(runTask, events, tasks) {
    for (let i = 0; i < events.length; ++i) {
        const task = events[i];
        if (task.active) {
            runTask(task);
            // Reschedule periodic repeating tasks
            // Check active again, since a task may have canceled itself
            if (task.period >= 0 && task.active) {
                task.time = task.time + task.period;
                insertByTime(task, tasks);
            }
        }
    }
    return tasks;
}
function insertByTime(task, timeslots) {
    const l = timeslots.length;
    const time = getTime(task);
    if (l === 0) {
        timeslots.push(newTimeslot(time, [task]));
        return;
    }
    const i = binarySearch(time, timeslots);
    if (i >= l) {
        timeslots.push(newTimeslot(time, [task]));
    }
    else {
        insertAtTimeslot(task, timeslots, time, i);
    }
}
function insertAtTimeslot(task, timeslots, time, i) {
    const timeslot = timeslots[i];
    if (time === timeslot.time) {
        addEvent(task, timeslot.events);
    }
    else {
        timeslots.splice(i, 0, newTimeslot(time, [task]));
    }
}
function addEvent(task, events) {
    if (events.length === 0 || task.time >= events[events.length - 1].time) {
        events.push(task);
    }
    else {
        spliceEvent(task, events);
    }
}
function spliceEvent(task, events) {
    for (let j = 0; j < events.length; j++) {
        if (task.time < events[j].time) {
            events.splice(j, 0, task);
            break;
        }
    }
}
function getTime(scheduledTask) {
    return Math.floor(scheduledTask.time);
}
/**
 * @deprecated
 */
function removeAllFrom(f, timeslot) {
    timeslot.events = removeAll(f, timeslot.events);
}
function binarySearch(t, sortedArray) {
    let lo = 0;
    let hi = sortedArray.length;
    let mid, y;
    while (lo < hi) {
        mid = Math.floor((lo + hi) / 2);
        y = sortedArray[mid];
        if (t === y.time) {
            return mid;
        }
        else if (t < y.time) {
            hi = mid;
        }
        else {
            lo = mid + 1;
        }
    }
    return hi;
}
const newTimeslot = (t, events) => ({ time: t, events: events });

/** @license MIT License (c) copyright 2010-2017 original author or authors */
/* global setTimeout, clearTimeout */
class ClockTimer {
    constructor(clock) {
        this._clock = clock;
    }
    now() {
        return this._clock.now();
    }
    setTimer(f, dt) {
        return dt <= 0 ? runAsap(f) : setTimeout(f, dt);
    }
    clearTimer(t) {
        return t instanceof Asap ? t.cancel() : clearTimeout(t);
    }
}
class Asap {
    constructor(f) {
        this.f = f;
        this.active = true;
    }
    run() {
        if (this.active) {
            return this.f();
        }
    }
    error(e) {
        throw e;
    }
    cancel() {
        this.active = false;
    }
}
function runAsap(f) {
    const task = new Asap(f);
    defer(task);
    return task;
}

/* global performance, process */
class RelativeClock {
    constructor(clock, origin) {
        this.origin = origin;
        this.clock = clock;
    }
    now() {
        return this.clock.now() - this.origin;
    }
}
class HRTimeClock {
    constructor(hrtime, origin) {
        this.origin = origin;
        this.hrtime = hrtime;
    }
    now() {
        const hrt = this.hrtime(this.origin);
        return (hrt[0] * 1e9 + hrt[1]) / 1e6;
    }
}
const clockRelativeTo = (clock) => new RelativeClock(clock, clock.now());
const newPerformanceClock = () => clockRelativeTo(performance);
/**
 * @deprecated will be removed in 2.0.0
 * Date.now is not monotonic, and performance.now is ubiquitous:
 * @see https://caniuse.com/#search=performance.now
 */
const newDateClock = () => clockRelativeTo(Date);
const newHRTimeClock = () => new HRTimeClock(process.hrtime, process.hrtime());
const newPlatformClock = () => {
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
        return newPerformanceClock();
    }
    else if (typeof process !== 'undefined' && typeof process.hrtime === 'function') {
        return newHRTimeClock();
    }
    return newDateClock();
};

/**
 * Read the current time from the provided Scheduler
 */
const currentTime = (scheduler) => scheduler.currentTime();
/**
 * Schedule a task to run as soon as possible, but
 * not in the current call stack
 */
const asap = curry2((task, scheduler) => scheduler.scheduleTask(0, 0, -1, task));
/**
 * Schedule a task to run after a millisecond delay
 */
const delay = curry3((delay, task, scheduler) => scheduler.scheduleTask(0, delay, -1, task));
/**
 * Schedule a task to run periodically, with the
 * first run starting asap
 */
const periodic = curry3((period, task, scheduler) => scheduler.scheduleTask(0, 0, period, task));
/**
 * Cancel a scheduledTask
 */
const cancelTask = (scheduledTask) => scheduledTask.dispose();
/**
 * Cancel all ScheduledTasks for which a predicate is true
 * @deprecated Will be removed in 2.0.0
 */
const cancelAllTasks = curry2((predicate, scheduler) => {
    console.warn(`DEPRECATED cancelAllTasks to be removed in 2.0.0`);
    return scheduler.cancelAll(predicate);
});

const schedulerRelativeTo = curry2((offset, scheduler) => new RelativeScheduler(offset, scheduler));

/** @license MIT License (c) copyright 2010-2017 original author or authors */
const newScheduler = curry2((timer, timeline) => new SchedulerImpl(timer, timeline));
const newDefaultScheduler = () => new SchedulerImpl(newDefaultTimer(), new TimelineImpl());
const newDefaultTimer = () => new ClockTimer(newPlatformClock());
const newClockTimer = (clock) => new ClockTimer(clock);
const newTimeline = () => new TimelineImpl();

export { HRTimeClock, RelativeClock, asap, cancelAllTasks, cancelTask, clockRelativeTo, currentTime, delay, newClockTimer, newDateClock, newDefaultScheduler, newDefaultTimer, newHRTimeClock, newPerformanceClock, newPlatformClock, newScheduler, newTimeline, periodic, schedulerRelativeTo };
//# sourceMappingURL=index.es.js.map
