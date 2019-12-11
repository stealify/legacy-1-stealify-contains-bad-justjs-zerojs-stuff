# @most/index

Index and count events.  More generally, pair events with any iterative value.

```typescript
import { index, count } from '@most/index'
import { Stream, periodic } from '@most/core'

// 0 1 2 3 4 ...
const si: Stream<number> = index(periodic(1000))

// 1 2 3 4 5 ...
const sc: Stream<number> = count(periodic(1000))
```

## Get it

```
npm install --save @most/index
```

## API

### count :: Stream a → Stream number

Count events.

```typescript
// 1 2 3 ...
count(periodic(1000))
```

### withCount :: Stream a → Stream [number, a]

Pair events with a 1-based count.

```typescript
// [1, 'withCount'] [2, 'withCount'] [3, 'withCount'] ...
withCount(constant('withCount', periodic(1000)))
```

### index :: Stream a → Stream number

Index events.

```typescript
// 0 1 2 ...
index(periodic(1000))
```

### withIndex :: Stream a → Stream [number, a]

Pair events with a 0-based index.

```typescript
// [0, 'withIndex'] [1, 'withIndex'] [2, 'withIndex'] ...
withIndex(constant('withIndex', periodic(1000)))
```

### withIndexStart :: number → Stream a → Stream [number, a]

Pair events with a `start`-based index.

```typescript
// [100, 'withIndexStart'] [101, 'withIndexStart'] [102, 'withIndexStart'] ...
withIndexStart(100, constant('withIndexStart', periodic(1000)))
```

### indexed :: (s → [i, s]) → s → Stream a → Stream [i, a]

Pair events with any iteratively computed index.

```typescript
const stringIndex = (s: string) => (prev: string): [string, string] =>
  [prev, prev + s]

// ['', 'indexed'], ['a', 'indexed'], ['aa', 'indexed'], ['aaa', 'indexed']
indexed(stringIndex('a'), '', constant('indexed', periodic(1000)))
```
