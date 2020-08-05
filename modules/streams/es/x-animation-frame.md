[![Build Status](https://travis-ci.org/mostjs/x-animation-frame.svg?branch=master)](https://travis-ci.org/mostjs/x-animation-frame)

**EXPERIMENTAL** This is an experimental package.

# @most/animation-frame

Create a stream of animation frames.

## Get it

`npm i @most/animation-frame --save`

`yarn add @most/animation-frame`

## Types

```js
export type DOMHighResTimeStamp = number

export type AnimationFrameHandler = DOMHighResTimeStamp => void

export type AnimationFrameRequest = number

export type AnimationFrames = {
  requestAnimationFrame: AnimationFrameHandler => AnimationFrameRequest,
  cancelAnimationFrame: AnimationFrameRequest => void
}
```

Note that `window` satisfies the `AnimationFrames` type, so you can pass `window` to the API methods below.

## API

### nextAnimationFrame :: AnimationFrames &rarr; Stream DOMHighResTimeStamp

Create a stream containing only the _next_ animation frame.

### animationFrames :: AnimationFrames &rarr; Stream DOMHighResTimeStamp

Create an infinite stream containing all future animation frames.  This can be used to efficiently update a UI on each animation frame.  Use [`take`](http://mostcore.readthedocs.io/en/latest/api.html#take), [`until`](http://mostcore.readthedocs.io/en/latest/api.html#until), etc. to make the stream finite if you need.

```js
import { animationFrames } from '@most/animation-frame'
import { tap, sample, runEffects } from '@most/core'
import { newDefaultScheduler } from '@most/scheduler'

const afs = animationFrames(window)
const applicationUpdates = createApplicationUpdatesStream()

// Sample updates at each animationFrame and render the UI
const render = tap(renderUpdates, sample(applicationUpdates, afs))

runEffects(render, newDefaultScheduler())
