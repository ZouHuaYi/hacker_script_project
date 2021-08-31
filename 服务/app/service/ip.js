'use strict';

const Service = require('egg').Service;

class Ip extends Service {
  async create(iplist = []) {
    // 新增数据
    console.log(iplist);
    // await this.app.mysql.query();
  }
}

module.exports = Ip;
