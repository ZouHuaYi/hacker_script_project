const { request, writeFile, readFile } = require('./utils')

request({
  url: 'https://www.baidu.com',
  method: 'get',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Safari/537.36'
  }
}).then(res => {
  console.log('res', res.data.length)
})
// for (let i = 0; i < 10; i++) {
//   writeFile('./log', '_'+i, {flag: 'a'})
// }
// readFile('./log', line => {
//   console.log('line', line)
// })
