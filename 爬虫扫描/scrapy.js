const puppeteer = require('puppeteer')
const path = require('path')
const { writeCsvUrl } = require('./utils')

// 过滤不请求的链接
function ignoreLinkBoolean(url) {
  // 过滤base64图片加载
  if (/^data:/.test(url)) {
    return true
  }
  // 过滤一些加载链接黑名单
  const ignoreUrl = ['.png', '.jpg', '.gif', '.woff', '.css', '.ttf', '.svg', '.eot', 'woff2']
  const ext = path.extname(url)
  if (ignoreUrl.includes(ext)) {
    return true
  }
  return false
}

(async () => {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();

  const result = []
  const jsLinks = []
  const errorLinks = []
  // 开始请求拦截
  await page.setRequestInterception(true)
  page.on('request', request => {
    const url = request.url()
    if (ignoreLinkBoolean(url)) {
      request.abort()
    } else {
      request.continue();
    }
  });

  page.on('response', async res => {
    // 这里处理响应体数据
    // console.log(res)
  });

  page.on('requestfinished', req => {
    const url = req.url()
    if (path.extname(url) === '.js') {
      jsLinks.push(url)
    } else {
      result.push(url)
    }
  });

  page.on('requestfailed', req => {
    errorLinks.push(req.url())
  });

  await page.goto('https://www.autohome.com.cn', {
    waitUntil: 'networkidle0'
  });

  writeCsvUrl('www.autohome.com.cn_api', result)
  writeCsvUrl('www.autohome.com.cn_js', jsLinks)
  writeCsvUrl('www.autohome.com.cn_error', errorLinks)

  await browser.close();

})();
