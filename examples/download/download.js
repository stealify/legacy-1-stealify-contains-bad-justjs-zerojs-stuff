const { fetch } = require('fetch.js')

async function main () {
  const [url, fileName] = stealify.args.slice(2)
  const result = await fetch(url, fileName)
  stealify.print(JSON.stringify(result, null, '  '))
}

main().catch(err => stealify.error(err.stack))
