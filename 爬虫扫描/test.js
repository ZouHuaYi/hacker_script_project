
const p1 = new Promise(resolve => resolve('成功1'))
const p2 = new Promise(resolve => resolve('成功2'))
const p3 = new Promise(resolve => resolve('成功3'))
Promise.all([p1, p2, p3]).then(result=> console.log(result))
Promise.race([p1, p2, p3]).then(result=> console.log(result))

const promise1 = Promise.resolve(3)
const promise2 = new Promise(((resolve, reject) => setTimeout(reject, 100, 'foo')))
Promise.allSettled([promise1, promise2])
  .then(res => console.log(res))
