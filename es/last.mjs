const last = (stream) => new Last(stream)
class Last {
  constructor (source) {
    this.source = source
  }
  run (sink, scheduler) {
    return this.source.run(new LastSink(sink), scheduler)
  }
}
class LastSink {
  constructor (sink) {
    this.sink = sink
  }
  event (_, val) {
    this.held = { val }
  }
  error (t, e) {
    this.sink.error(t, e)
  }
  end (t) {
    if (this.held) {
      this.sink.event(t, this.held.val)
    }
    this.sink.end(t)
  }
}
export { last }
// # sourceMappingURL=index.js.map