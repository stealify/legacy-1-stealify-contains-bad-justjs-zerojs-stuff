# most-from-array

Creates a [core](https://github.com/mostjs/core) stream from an array.

## Usage

```ts
import { fromArray } from 'most-from-array'

const stream = fromArray([1, 2, 3, 4])
const tapped = tap(console.log, stream)
runEffects(tapped, newDefaultScheduler())
/*
Console output:
1
2
3
4
*/
```