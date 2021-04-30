function fixed () {
  return new Promise((resolve, reject) => {
    const timer = stealify.setInterval(() => {
      resolve()
      // if i dont do nextTick here, when the handle closes, the loop will break and so the next microTask will not run
      stealify.sys.nextTick(() => stealify.clearInterval(timer))
    }, 100)
  })
}

function broken () {
  return new Promise((resolve, reject) => {
    const timer = stealify.setInterval(() => {
      stealify.clearInterval(timer)
      resolve()
    }, 1)
  })
}

async function run () {
  await broken()
  stealify.print('test 1')
  await broken()
  stealify.print('test 2')
}

run()
