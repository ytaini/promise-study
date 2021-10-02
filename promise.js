//使用class
class Promise{

  constructor(executor) {
    //为Promise对象添加属性
    this.PromiseState = 'pending'
    this.PromiseResult = null

    //声明保存回调函数的属性
    this.callbacks = []

    //保存实例对象this的值
    let _this = this

    //声明resolve,reject函数
    function resolve(data) {

      //设置Promise的实例对象的状态只能修改一次
      if (_this.PromiseState !== 'pending') return

      //1、修改对象的状态
      _this.PromiseState = 'fulfilled'
      //2、设置对象的结果
      _this.PromiseResult = data


      //调用成功的回调函数。
      _this.callbacks.forEach(callback => {
        callback.onResolved(data)
      })


    }

    function reject(data) {

      //设置Promise的实例对象的状态只能修改一次
      if (_this.PromiseState !== 'pending') return

      //1、修改对象的状态
      _this.PromiseState = 'reject'
      //2、设置对象的结果
      _this.PromiseResult = data

      //调用失败的回调函数。
      _this.callbacks.forEach(callback => {
        callback.onRejected(data)
      })
    }

    try {
      //执行器函数是同步调用的
      executor(resolve, reject)
    } catch (e) {
      reject(e)
    }

  }

  then(onResolved = value => value,
       onRejected = reason => { throw reason}){
    //then方法返回一个新的Promise对象
    return new Promise((resolve, reject) => {

      //判断then中指定回调函数的返回值类型
      let callback = (onState) => {
        //如果出现异常
        try {
          //获取回调函数的执行结果
          let result = onState(this.PromiseResult)

          //判断执行结果的类型。
          //如果为Promise对象，那么就可以调它的then方法。
          if (result instanceof Promise) {
            result.then(value => {
              resolve(value)
            }, reason => {
              reject(reason)
            })
          } else {
            //如果非Promise对象，那么返回一个成功的promise对象。
            resolve(result)
          }
        } catch (e) {
          reject(e)
        }
      }

      if (this.PromiseState === 'fulfilled') {
        setTimeout(()=>{
          callback(onResolved)
        })
      }

      if (this.PromiseState === 'reject') {
        setTimeout(() => {
          callback(onRejected)
        })
      }

      if (this.PromiseState === 'pending') {
        //保存onResolved，onRejected
        this.callbacks.push({
          onResolved: () => {
            setTimeout(() => {
              callback(onResolved)
            })
          },
          onRejected: () => {
            setTimeout(() => {
              callback(onRejected)
            })
          }
        })
      }
    })
  }

  catch(onRejected) {
    return this.then(undefined, onRejected)
  }

  static resolve(data) {
    return new Promise((resolve, reject) => {

      if (data instanceof Promise) {
        data.then(value => {
          resolve(value)
        }, reason => {
          reject(reason)
        })
      } else {
        resolve(data)
      }
    })
  }

  static reject(data) {
    return new Promise((resolve, reject) => {
      reject(data)
    })
  }

  static all(data) {
    return new Promise((resolve, reject) => {
      let resultArr = [] //保存所有promise对象的result组成数组
      let successCount = 0 //记录result为成功的promise对象的个数


      data.forEach((p,index) => {
        p.then(v => {
          //进来这里说明这个promise对象的result是成功的.
          successCount++
          //返回的result为所有promise对象result组成的数组
          resultArr[index] = v
          //当所有promise对象的result都是成功时，才调用
          if (successCount === data.length) {
            resolve(resultArr)
          }
        }, r => {
          reject(r)
        })
      })
    })
  }

  static race(data) {
    return new Promise((resolve,reject) => {
      data.forEach((p, index) => {
        p.then(v => {
          resolve(v)
        },r => {
          reject(r)
        })
      })
    })
  }
}


/*

//声明Promise构造器
function Promise(executor) {

  //为Promise对象添加属性
  this.PromiseState = 'pending'
  this.PromiseResult = null

  //声明保存回调函数的属性
  this.callbacks = []

  //保存实例对象this的值
  let _this = this

  //声明resolve,reject函数
  function resolve(data) {

    //设置Promise的实例对象的状态只能修改一次
    if (_this.PromiseState !== 'pending') return

    //1、修改对象的状态
    _this.PromiseState = 'fulfilled'
    //2、设置对象的结果
    _this.PromiseResult = data


    //调用成功的回调函数。
    _this.callbacks.forEach(callback => {
        callback.onResolved(data)
    })


  }

  function reject(data) {

    //设置Promise的实例对象的状态只能修改一次
    if (_this.PromiseState !== 'pending') return

    //1、修改对象的状态
    _this.PromiseState = 'reject'
    //2、设置对象的结果
    _this.PromiseResult = data

    //调用失败的回调函数。
    _this.callbacks.forEach(callback => {
        callback.onRejected(data)
    })
  }

  try {
    //执行器函数是同步调用的
    executor(resolve, reject)
  } catch (e) {
    reject(e)
  }


}

//给Promise实例对象添加then方法。
//给onRejected一个默认的函数。实现异常穿透。
Promise.prototype.then = function (onResolved = value => value,
                                   onRejected = reason => {
                                     throw reason
                                   }) {
  //then方法返回一个新的Promise对象
  return new Promise((resolve, reject) => {

    //判断then中指定回调函数的返回值类型
    let callback = (onState) => {
      //如果出现异常
      try {
        //获取回调函数的执行结果
        let result = onState(this.PromiseResult)

        //判断执行结果的类型。
        //如果为Promise对象，那么就可以调它的then方法。
        if (result instanceof Promise) {
          result.then(value => {
            resolve(value)
          }, reason => {
            reject(reason)
          })
        } else {
          //如果非Promise对象，那么返回一个成功的promise对象。
          resolve(result)
        }
      } catch (e) {
        reject(e)
      }
    }

    if (this.PromiseState === 'fulfilled') {
      setTimeout(()=>{
        callback(onResolved)
      })
    }

    if (this.PromiseState === 'reject') {
      setTimeout(() => {
        callback(onRejected)
      })
    }

    if (this.PromiseState === 'pending') {
      //保存onResolved，onRejected
      this.callbacks.push({
        onResolved: () => {
          setTimeout(() => {
            callback(onResolved)
          })
        },
        onRejected: () => {
          setTimeout(() => {
            callback(onRejected)
          })
        }
      })
    }
  })
}


//给Promise实例对象添加catch方法
Promise.prototype.catch = function (onRejected) {
  return this.then(undefined, onRejected)
}

//给Promise函数对象添加resolve方法
Promise.resolve = function (data) {
  return new Promise((resolve, reject) => {

    if (data instanceof Promise) {
      data.then(value => {
        resolve(value)
      }, reason => {
        reject(reason)
      })
    } else {
      resolve(data)
    }
  })
}

Promise.reject = function (data) {
  return new Promise((resolve, reject) => {
    reject(data)
  })
}

Promise.all = function (data) {
  return new Promise((resolve, reject) => {
    let resultArr = [] //保存所有promise对象的result组成数组
    let successCount = 0 //记录result为成功的promise对象的个数


    data.forEach((p,index) => {
      p.then(v => {
        //进来这里说明这个promise对象的result是成功的.
        successCount++
        //返回的result为所有promise对象result组成的数组
        resultArr[index] = v
        //当所有promise对象的result都是成功时，才调用
        if (successCount === data.length) {
          resolve(resultArr)
        }
      }, r => {
        reject(r)
      })
    })
  })
}

Promise.race = function (data) {
  return new Promise((resolve,reject) => {
    data.forEach((p, index) => {
      p.then(v => {
        resolve(v)
      },r => {
        reject(r)
      })
    })
  })
}

*/
