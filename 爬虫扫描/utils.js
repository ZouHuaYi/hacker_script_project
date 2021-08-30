const http = require('http')
const https = require('https')
const Axios = require('axios')
const readline = require('readline')
const tunnel = require('tunnel')
const fs = require('fs')

function isHttps(url) {
  return url.indexOf('https') > -1
}
// 兼容 https 和 http 方法
function httpOrHttps(url, callback, errorLog) {
  if (isHttps(url)) {
    https.get(url, callback).on('error', (e) => {
      errorLog && errorLog(url, e)
    })
  } else {
    http.get(url, callback).on('error', (e) => {
      errorLog && errorLog(url, e)
    })
  }
}

/*
* 使用了小飞机 代理
* */
const tunnelProxy = tunnel.httpsOverHttp({
  proxy: {
    host: '127.0.0.1',
    port: '1080',
  },
});

Axios.defaults.proxy = false
Axios.defaults.timeout = 600000
// Axios.defaults.httpsAgent = tunnelProxy
// Axios.defaults.httpAgent = tunnelProxy

// 使用 axios 请求接口
async function request(body) {
  const method = body.method || 'get'
  const option = {
    ...body,
    url: body.url,
    method
  }

  if (body.headers) {
    option.headers = {
      ...body.headers
    }
  }

  if (body.data) {
    if (method === 'get' || method === 'delete') {
      option.params = body.data
    } else {
      option.data = body.data
    }
  }
  return new Promise((resolve, reject) => {
    Axios(option).then(res => {
      resolve(res)
    }).catch(err => {
      reject(err)
    })
  })
}

// 导出csv 格式文件
function writeCsvUrl(name, data, prefix='0_') {
  let csvContent = ''
  const linebreak = process.platform === 'win32' ? '\r\n' : '\n'
  if (prefix === '0_') {
    csvContent = '\ufeff' + 'id,url' + linebreak
  } else {
    csvContent = ''
  }
  data.forEach((item, index) => {
    csvContent += `${prefix}${index},${item}${linebreak}`
  })

  // 写入文件
  fs.writeFileSync(`data/${name}.csv`, csvContent, {
    flag: 'a+'
  })
}


/*
* flag: {
*   a: 追加，不存在新建
*   a+: 读取和追加
*   ax+: a+一样，存在则失败
*   as+: 同步模式打开文件进行追加
*   r和w 类似
* }
* */
function writeFile(file, data, options = {}) {
  let opts = {
    encoding: 'utf8',
    flag: 'w',
    ...options
  }
  fs.writeFileSync(file, data, {...opts})
}

function readFile(file, cb) {
  const rl = readline.createInterface({
    input: fs.createReadStream(file),
    output: process.stdout,
    terminal: false
  })
  rl.on('line', line => {
    cb && cb(line)
  })
}

module.exports = {
  request,
  isHttps,
  httpOrHttps,
  writeCsvUrl,
  writeFile,
  readFile
}
