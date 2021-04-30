stealify.print(BigInt(stealify.hrtime()) - BigInt(stealify.START))
const { http } = stealify.library('../modules/picohttp/http.so', 'http')
stealify.print(JSON.stringify(Object.getOwnPropertyNames(http)))
