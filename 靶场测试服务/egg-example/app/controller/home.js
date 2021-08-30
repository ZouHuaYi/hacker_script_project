'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    ctx.body = 'hi, egg';
  }
  // sql 注入测试
  async sqlTest() {
    const { ctx, app } = this;
    const { id } = ctx.request.query;
    const sql = 'select * from user where id=' + id;
    console.log(sql);
    const res = await app.mysql.query(sql);
    ctx.body = res;
  }
}

module.exports = HomeController;
