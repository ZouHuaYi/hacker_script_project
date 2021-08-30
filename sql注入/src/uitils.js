/*
* 通用方法
* */


// 延时函数
export function delay (tim = 1) {
  return new Promise(resolve => {
    setTimeout(() => resolve(), tim * 1000)
  })
}

// 处理最终函数方法
function handlePromiseFun (funs) {
  return new Promise(resolve => {
    Promise.all(funs).then(res => {
      resolve()
    }).catch(e => {
      if (e.message.indexOf('timeout') > -1) {
        resolve(e.config.data)
      } else {
        resolve()
      }
    })
  })
}

//  切分请求接口
export async function batchesDealWith (batch, proFuns = []) {
  const step = Math.ceil(proFuns.length / batch)
  let result
  for (let i = 0; i < step; i++) {
    const funs = proFuns.splice(i, batch)
    const res = await handlePromiseFun(funs)
    if (res) {
      result = res
      break
    }
  }
  return result
}
