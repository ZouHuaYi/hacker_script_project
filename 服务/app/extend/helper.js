'use strict';
const puppeteer = require('puppeteer');
const Axios = require('axios');
const cheerio = require('cheerio');
Axios.defaults.proxy = false;
Axios.defaults.timeout = 600000;

function delay(tim = 1) {
  return new Promise(resolve => {
    setTimeout(() => resolve(), tim * 1000);
  });
}


module.exports = {
  // ajax 爬虫
  requestAjax(body) {
    const method = body.method || 'get';
    const option = {
      ...body,
      url: body.url,
      method,
    };

    if (body.timeout) {
      Axios.defaults.timeout = body.timeout;
    }

    if (body.headers) {
      option.headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
        ...body.headers,
      };
    }

    if (body.data) {
      if (method === 'get' || method === 'delete') {
        option.params = body.data;
      } else {
        option.data = body.data;
      }
    }
    return new Promise(resolve => {
      Axios(option).then(res => {
        resolve([ null, res ]);
      }).catch(err => {
        resolve([ err ]);
      });
    });
  },
  // 爬取页面
  async spider(body) {
    console.log('执行这里吗？');
    const [ err, res ] = await this.requestAjax(body);
    console.log(err, res);
    if (err) return;
    const html = res.data;
    const $ = cheerio.load(html);
    console.log($);
  },
  // 使用puppeteer
  async onHeaderBower() {
    const { ctx } = this;
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    // 直接写死
    await page.goto('https://proxy-list.org/chinese/index.php?p=1&setlang=chinese', {
      waitUntil: 'domcontentloaded', // 满足什么条件触发
    });
    // 中间数据处理
    runpage();
    async function runpage() {
      const ip = await page.$$eval('#proxy-table div.table-wrap ul li.proxy', divs => {
        const list = [];
        divs.forEach(item => {
          const ipstr = item.textContent.replace(/^Proxy\(*.+?\)/i, '');
          list.push(ipstr);
        });
        return list;
      });
      const http = await page.$$eval('#proxy-table div.table-wrap ul li.https', (divs, ip) => {
        return divs.map((item, index) => {
          const ips = item.textContent.indexOf('http') > -1 ? `${item.textContent}://${ip[index]}` : `http://${ip[index]}`;
          return ips;
        });
      }, ip);
      // 插入数据库
      await ctx.service.ip.create(http);
      // 点击下一页
      await page.evaluate(async () => {
        const next = $('#content div.table-menu > a.next');
        if (next && next[0]) {
          next[0].click();
        }
      });
      page.waitForSelector('#proxy-table div.table-wrap ul li.https').then(() => {
        runpage();
      }).catch(() => {
        browser.close();
      });
    }
  },
  // 校验ip 是否可以使用
};
