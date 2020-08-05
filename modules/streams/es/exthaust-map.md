# most-exhaust-map

```
exhaustMap :: (a -> Stream b) -> Stream a -> Stream b
```

`exhaustMap` receives a map function which returns a stream, and a source stream.
It applies the map function to the value from its source to create an internal stream, and proxies the events to the next stream.
It skips creating internal streams until the current internal stream terminates.

```
s:                -a-b-c-d-e-f-g-h-i|
f(a):              1--2--3|
f(e):                      1--2--3|
f(i):                              1--2--3|
exhaustMap(f, s): -1--2--3-1--2--3-1--2--3|
```

Note that `f` is not applied on `b`, `c`, `d`, `f`, `g` and `h` in this case.

## Installation

```
npm install --save most-exhaust-map
```

