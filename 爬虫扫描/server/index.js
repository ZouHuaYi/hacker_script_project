const http = require("http")
const path  = require('path')
const fs = require("fs")

function resolve(url) {
  return path.join(__dirname, url)
}

const hostName = '127.0.0.1'
const port = 3000

const server = http.createServer((req, res) => {
  const url = req.url
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Referer', 'http://sandbox.prompt.ml/')
  if (url.indexOf('.html') > -1) {
    res.writeHead(200, {
      "Content-Type": "Text/Html;Chartset=utf-8"
    })
    fs.readFile(resolve(url), 'utf-8', (err, data) => {
     if (err) {
       res.write('error html')
       res.end()
       return
     }
     res.write(data)
     res.end()
   })
  } else if(url.indexOf('.js')) {
    res.writeHead(200, {
      "Content-Type": "Text/javascript;Chartset=utf-8"
    })
    fs.readFile(resolve(url), 'utf-8', (err, data) => {
      if (err) {
        res.write('error js')
        res.end()
        return
      }
      res.write(data)
      res.end()
    })
  } else {
    res.write('hello world')
    res.end()
  }
})

server.listen(port, hostName, function(){
  console.log(`server running.... at http://${hostName}:${port}`)
})

