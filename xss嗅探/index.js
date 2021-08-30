const cheerio = require('cheerio')
const fs = require('fs')
const {
  request
} = require('./utils')
const ast = require('./ast')

// 收录链接范围
const needUrl = ['autohome.com.cn', 'che168.com', 'yesauto.com']



function hasHttp(url) {
  return /^https?:/.test(url)
}

function ignoreUrl(url) {
  if (!url) return true
  url = url.trim()
  return url.trim() === '/'
    || /javascript:/.test(url)
    || url[0] === '#'
    || url[0] === '?'
    || url.includes('.jpg')
    || url.includes('.png')
    || url.includes('.gif')
    || url.includes('.css')
    || url.includes('.svg')
}

function dwUrl(oldUrl, url) {
  if (oldUrl === url) {
    return false
  }
  // 处理 URL
  if (hasHttp(url)) {
    // http 或者 https 链接
    try {
      new URL(url)
      return url
    } catch (e) {
      return false
    }
  } else {
    // 文件类型或者别的协议的时候
    if (/^\/\//.test(url)) {
      return 'https:' + url.trim()
    } else {
      if(ignoreUrl(url)) {
        return false
      }
      // 目录
      let origin = new URL(oldUrl).origin
      if (url[0] !== '/') {
        origin += '/'
      }
      return origin + url.trim()
    }
  }
}

// 分析 清除 归类链接
function clearLinks(oldUrl, links) {
  let linksArr = []
  links.forEach(item => {
    const url = dwUrl(oldUrl, item)
    if (url && needUrl.some(item => url.indexOf(item)>-1)) {
      linksArr.push(url)
    }
  })
  // 链接去重
  linksArr = [...new Set(linksArr)]
  // 对链接进行分类，正在的去重操作
  const objUrl = {}
  const endlinks = []
  const testLinks = []
  linksArr.forEach(item => {
   const nu = new URL(item)
    if (objUrl[nu.origin]) {
      objUrl[nu.origin].push(`${nu.pathname}${nu.hash}${nu.search}`)
    } else {
      objUrl[nu.origin] = [`${nu.pathname}${nu.hash}${nu.search}`]
    }
  })
  for (let keys in objUrl) {
    const item = objUrl[keys]
    if (Array.isArray(item)) {
      for (let i = 0; i < item.length; i++) {
        testLinks.push(`${keys}${item[i]}`)
      }
      for (let i = 0; i < item.length; i++) {
        for (let j = i+1; j < item.length; j++) {
          if (Math.abs(item[i].length - item[j].length) > 3) {
            continue
          }
          // 相似度
          const ls = compareString(item[i], item[j])
          if (ls > 80) {
            item.splice(j, 1)
            j -= 1
          }
        }
        endlinks.push(`${keys}${item[i]}`)
      }
    }
  }
  // 还原链接
  writeCsv('sssss', endlinks)
  writeCsv('xxxxx', testLinks)
  return linksArr
}

// js 代码中提取 http
function extract(str) {
  // 提取代码中的 url
  const re = /[\'\"\`](https?:\/\/[a-zA-Z0-9_].*?|\/\/[a-zA-Z0-9_].*?)[\'\"\`]/g
  let s = re.exec(str)
  const links = []
  while (s !== null) {
    links.push(s[1])
    s = re.exec(str)
  }
  return links
}

/*
* js - [jquery, vue, react]
* link 目录分类
* url 前后的空格和换行符号清除
* 使用 new URL方法解析路径
*
*/
function getUrlAndClear (res) {
  let linksArr = []
  const html = res.data
  const url = res.config.url
  // js 文件
  if (/.js/.test(url)) {
    dwScript(html)
  } else {
    const $ = cheerio.load(html)
    $('a').each(function (index, ele) {
      const u = $(this).attr('href')
      linksArr = linksArr.concat(u)
    })
    $('iframe').each(function (index, ele) {
      const u = $(this).attr('src')
      linksArr = linksArr.concat(u)
    })
    $('script').each(function (index, ele) {
      const jsu = $(this).attr('src')
      if (jsu) {
        // 这里处理 js 链接
        linksArr.push(jsu)
      } else {
        // 这里处理 js 文本
        const u = dwScript($(this).html())
        linksArr = linksArr.concat(u)
      }
    })
  }
  const ls = clearLinks(res.config.url, linksArr)
}

// 解析js 文件的内容
function dwScript(jsDom) {
  return extract(jsDom)
}

// 比较两个字符串
function compareString(xStr, yStr) {
  let zIndex = 0
  let len = xStr.length + yStr.length
  const x = xStr.split('')
  const y = yStr.split('')

  let a = x.shift()
  let b = y.shift()

  while (a !== undefined && b !== undefined) {
    if (a === b) {
      zIndex++
      a = x.shift()
      b = y.shift()
    } else if (a < b) {
      a = x.shift()
    } else if (a > b) {
      b = y.shift()
    }
  }
  return zIndex/len * 200
}

function requestAllurl (url) {
  request({
    url: url
  }).then(res => {
    // status = 200
    // headers 响应头
    // config 请求配置 { url method}
    // data html 数据
    if (res.status === 200) {
      getUrlAndClear(res)
    } else {
      // 打印请求报错的状态码

    }
  }).catch(err => {
    console.log('error', err)
  })
}


// 导出csv 格式文件
function writeCsv(name, data, prefix='0_') {
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
  fs.writeFileSync(`${name}.csv`, csvContent, {
    flag: 'a+'
  })
}
console.log(compareString('/bbs/thread/66fc8c9cef4f14d1/95004806-1.html#pvareaid=3454614', '/bbs/thread/bbe025cb6b4b660f/95010301-1.html#pvareaid=3454614'))
//requestAllurl('https://www.autohome.com.cn/614/#pvareaid=3311278')
