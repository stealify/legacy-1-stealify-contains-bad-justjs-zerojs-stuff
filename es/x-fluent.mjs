// from mostjs/x-fluent flow only translation
const fluently = stream => new FluentStream(stream);
class FluentStream {

  constructor(stream) {
    this.stream = stream;
  }

  thru(f) {
    return new FluentStream(f(this.stream));
  }

  apply(f) {
    return f(this.stream);
  }

  run(sink, scheduler) {
    return this.stream.run(sink, scheduler);
  }
}

export { fluently, FluentStream };
//# sourceMappingURL=index.es.js.map