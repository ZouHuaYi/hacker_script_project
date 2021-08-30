const http = require('http')
const https = require('https')
const Axios = require('axios')
const tunnel = require('tunnel')

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
Axios.defaults.httpsAgent = tunnelProxy
Axios.defaults.httpAgent = tunnelProxy

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

module.exports = {
  request,
  isHttps,
  httpOrHttps
}
