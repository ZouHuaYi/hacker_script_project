'use strict';

const Service = require('egg').Service;

class Ip extends Service {
  async create(iplist = []) {
    // 新增数据
    // await this.app.mysql.query();
    let sql = 'insert into temp_ip_copy (ip) values ';
    sql += iplist.map(ip => {
      return `('${ip}')`;
    }).join(',');
    console.log(sql);
    await this.app.mysql.query(sql);
  }
}

module.exports = Ip;
