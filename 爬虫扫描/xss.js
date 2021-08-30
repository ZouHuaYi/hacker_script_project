const {
  request
} = require('./utils')


/*
* 嗅探页面回显 反射型 xss
* 自 xss
* dom 型 xss
* */

// 识别符号 字典
/*
* 编码包括
* url
* html 实体编码
* */
/*
* charCodeAt 字符转acii 10 进制
* toString(2)  10 进制转 2 进制
*
* */

const defaultString = `'<>"`

// 一个字符，acii 10 进制
function codeAt(str) {
  return str.charCodeAt()
}

// url 转码
function enUrl (str) {
  let s = ''
  for (let i = 0; i < str.length; i++) {
    s += '%'+ codeAt(str[i]).toString(16)
  }
  return s
}

/*
* 多次编码两种方案
* 对所有字符进行多次编码
* 使用 encodeURL 进行多次编码
* @ str 字符串
* @ step 转码次数
* @ type 多次转码的类型
* */
function mutiEncode(str, step=1, type=1) {
  let endStr = enUrl(str)
  step--
  while (step > 0) {
    step--
    if (type === 1) {
      endStr = encodeURI(endStr)
    } else if (type === 2) {
      endStr = enUrl(endStr)
    }
  }
  return endStr
}

/*
* html 实体编号
*
* */
function htmlCode(html, type=1) {
  let s = ''
  let q = type === 1 ? '&#' : '%26%23'
  for (let i = 0; i < html.length; i++) {
    s += q + codeAt(html[i]) + ';'
  }
  return s
}

function mutiHtmlCode(html, step=1, type=1) {
  let endStr = htmlCode(html)
  while (step > 1) {
    step --
    endStr = htmlCode(endStr, type)
  }
  return endStr
}


// 判断解析那种变种或者无需变种
// zfyi<>'"zfyi
// 先 3 种编码
function createXssCode (str) {
  const strlist = [`<`, `>`, `'`, `"`]
  let step = 1
  while (step < 4) {
    for (let i = 0; i < str.length; i++) {
      strlist.push(mutiEncode(str[i], step, 1))
      strlist.push(mutiEncode(str[i], step, 2))

      strlist.push(mutiHtmlCode(str[i], step, 1))
      strlist.push(mutiHtmlCode(str[i], step, 2))
      strlist.push(encodeURIComponent(mutiHtmlCode(str[i], step, 1)))
    }
    step++
  }
  return strlist
}

// 过滤处理数据
function clearReg(html) {
  // 截取数据的正则
  const reg = /zfyi(.*?)zhy/g
  let s = reg.exec(html)
  const end = []
  while (s !== null) {
    end.push(s[1])
    s = reg.exec(html)
  }
  console.log(end)
}


function testXssCode(cb) {
  const urlcode = Array.from(new Set(createXssCode(`<>'"`)))
  const endUrl = urlcode.map(url => {
    const u = `zfyi${url}zhy`
    return cb(u)
  })
  endUrl.forEach(url => {
    request({
      url: url
    }).then(res => {
      clearReg(res.data)
    }).catch(err=> {
      console.log('err', url)
    })
  })
}

testXssCode((q) => {
  return `https://m.alibaba.com/trade/search?SearchText=${q}&from=header&`
})
