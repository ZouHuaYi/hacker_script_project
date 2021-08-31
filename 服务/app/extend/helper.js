'use strict';

const Axios = require('axios');
const cheerio = require('cheerio');
Axios.defaults.proxy = false;
Axios.defaults.timeout = 600000;

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
    return new Promise((resolve, reject) => {
      Axios(option).then(res => {
        resolve([ null, res ]);
      }).catch(err => {
        resolve([ err ]);
      });
    });
  },
  // 爬取页面
  async spider(body, funcType) {
    const [ err, res ] = await this.requestAjax(body);
    if (err) return;
    const html = res.data;
    const $ = cheerio.load(html);
    console.log($);
  },
  // 处理不同的url
};
