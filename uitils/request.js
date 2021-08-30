const Axios = require('axios')
const tunnel = require('tunnel')

/*
* 使用了小飞机 代理
* */
const tunnelProxy = tunnel.httpsOverHttp({
  proxy: {
    host: '127.0.0.1',
    port: '1080',
  },
});

// 基本的配置
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

  if (body.timeout) {
    Axios.defaults.timeout = body.timeout
  }

  if (body.headers) {
    option.headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
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

module.exports = request
