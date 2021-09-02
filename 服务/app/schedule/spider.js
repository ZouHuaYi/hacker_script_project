'use strict';

module.exports = () => {
  return {
    schedule: {
      interval: '1h',
      type: 'all',
    },
    async task(ctx) {
      // 执行爬虫然后数据进库
      console.log('ctx', ctx);
    },
  };
};
