// 状态常量
const PENDING = "pending"; // 等待
const FULFILLED = "fulfilled"; // 成功
const REJECTED = "rejected"; // 失败
// 入参判断
const isFunction = (variable) => typeof variable === "function";

/**
 * 处理then方法回调函数中的返回值
 * @param {*} val
 * @param {*} resolve
 * @param {*} reject
 */
const resolvePromise = (val, resolve, reject) => {
  // 判断返回值是否为MyPromise的示例，如果是，则需要等待异步的结果，获取到结果在进行处理
  if (val instanceof MyPromise) {
    // val.then((res) => resolve(res), (err) => reject(err))
    // 等价于
    val.then(resolve, reject);
  } else {
    resolve(val);
  }
};

class MyPromise {
  constructor(handle) {
    if (!isFunction(handle)) {
      throw new Error("MyPromise must accept a function as a parameter");
    }
    // 初始化状态
    this.status = PENDING;
    // 初始化value
    this.value = undefined;

    // 成功回调队列：这里之所以是队列，
    // 原因是一个promise函数可以被多次then调用，每次调用传入的回调都要存起来
    // 当status改变的时候去依次执行
    this.fulfilledCallback = [];
    // 失败回调
    this.rejectedCallback = [];

    // 执行入参函数
    try {
      handle(this.resolve, this.reject);
    } catch (error) {
      this.reject(error);
    }
  }
  // 注意这里用箭头函数绑定this，不然this就丢了
  resolve = (val) => {
    if (this.status !== PENDING) return;
    this.status = FULFILLED;
    // 保存成功传入的参数
    this.value = val;
    // 循环执行成功队列，直到队列为空
    while (this.fulfilledCallback.length) {
      // 取出队列第一个回调函数并执行
      this.fulfilledCallback.shift()(this.value);
    }
  };
  reject = (err) => {
    if (this.status !== PENDING) return;
    this.status = REJECTED;
    // 保存失败传入的参数
    this.value = err;
    // 循环执行失败队列，直到队列为空
    while (this.rejectedCallback.length) {
      // 取出队列第一个回调函数并执行
      this.rejectedCallback.shift()(this.value);
    }
  };

  then(onFulfilled, onRejected) {
    const { value, status } = this;
    // then方法返回一个新的Promise实例
    return new MyPromise((resolve, reject) => {
      // 判断状态status，不同的状态调用不同的回调
      if (status === FULFILLED) {
        // 获取return的返回值
        let res = onFulfilled(value);
        resolvePromise(res, resolve, reject);
      } else if (status === REJECTED) {
        let res = onRejected(value);
        resolvePromise(res, resolve, reject);
      } else {
        // 当status状态为pedding时，说明还未获取到promise的值，此时将成功，失败回调存储起来
        // 处理return还是一个Promise对象的情况
        this.fulfilledCallback.push(() => {
          let res = onFulfilled(this.value);
          resolvePromise(res, resolve, reject);
        });
        this.rejectedCallback.push(() => {
          let res = onRejected(this.value);
          resolvePromise(res, resolve, reject);
        });
      }
    });
  }
  catch(onRejected) {
    return this.then(undefined, onRejected);
  }
  finally(callbcak) {
    return this.then(
      (value) => {
        return MyPromise.resolve(callbcak().then(() => value));
      },
      (err) => {
        return MyPromise.resolve(
          callbcak().then(() => {
            throw err;
          })
        );
      }
    );
  }

  static all(array) {
    let result = [];
    let index = 0;
    return new MyPromise((resolve, reject) => {
      function addData(key, value) {
        result[key] = value;
        index++;
        if (index === array.length) {
          resolve(result);
        }
      }
      for (let i = 0; i < array.length; i++) {
        let current = array[i];
        if (current instanceof MyPromise) {
          // promise 对象
          current.then(
            (value) => addData(i, value),
            (reason) => reject(reason)
          );
        } else {
          // 普通值
          addData(i, array[i]);
        }
      }
    });
  }
}

// 测试代码
new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve("成功");
  }, 500);
})
  .then((res) => {
    return new MyPromise((resolve, reject) => {
      resolve("first then resolve");
    });
  })
  .then((res) => {
    console.log("res=", res); // first then resolve
  });