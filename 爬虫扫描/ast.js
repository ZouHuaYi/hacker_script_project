/*
* 精准分析 js
* 获取有效的 js 内容
* 收集敏感的 js 信息
* 深入研究 js 树
* */

const esprima = require('esprima')
const estraverse = require('estraverse')

function astCode(jsCode) {
  // const AST = esprima.parseScript(jsCode)
  // estraverse.traverse(AST, {
  //   enter: (node) => {
  //     // console.log(node)
  //   }
  // })
}

module.exports = astCode
