const repos = [ require('./mostjs-repos.json'), require('./mostjs-community-repos.json')]

console.log(repos.map(x = x.clone_url))