---
title: 实现一个ES6中的Promise（翻译）
date: 2018/11/17
categories: 
 - 翻译集
tags: 
 - 翻译 
 - javaScript
---


由于在开发中突然想知道Promise的生命周期，以及联想到它其实是用状态机来实现的，很想知道它的实现方式，恰好又找到了一篇相对简单却又恰到好处的文章，感觉很不错，所以想搬运过来，原文没有多少晦涩难懂的句子（代码也占了文章很大的篇幅），所以也推荐直接看原文。如果想了解更多关于状态机的实现，可以多多评论，我试着写一发💁‍
翻译自www.promisejs.org ， [原文链接](https://www.promisejs.org/implementing/)。

---
## 前言

本文最初是作为[Stack Overflow](http://stackoverflow.com/questions/23772801/basic-javascript-promise-implementation-attempt/23785244#23785244)上的一个答案编写的。希望通过了解如何在JavaScript中实现Promise，你可以更好地理解Promise的行为方式。

## 状态机
由于Promise本质上只是一个状态机，我们应该从考虑接下来需要的状态信息开始。

```javascript
var PENDING = 0;
var FULFILLED = 1;
var REJECTED = 2;

function Promise() {
  // 存储状态:PENDING, FULFILLED or REJECTED
  var state = PENDING;

  // 存储在完成状态返回的value或拒绝状态返回的error
  var value = null;

  // 存储 成功 或 失败 的handlers(会被 .then 或 .done 调用)
  var handlers = [];
}
```
## 状态转换
接下来，让我们考虑一下可能发生的两个关键转换:fulfilling（完成） 和 rejecting（驳回/拒绝）:

```js
var PENDING = 0;
var FULFILLED = 1;
var REJECTED = 2;

function Promise() {
  // 存储状态:PENDING, FULFILLED or REJECTED
  var state = PENDING;

  // 存储在完成状态返回的value或拒绝状态返回的error
  var value = null;

  // 存储 成功 或 失败 的handlers(会被 .then 或 .done 调用)
  var handlers = [];

  function fulfill(result) {
    state = FULFILLED;
    value = result;
  }

  function reject(error) {
    state = REJECTED;
    value = error;
  }
}
```

上面的代码给我们展现了最基本的状态转换，但是让我们考虑一个额外的、更高级别的转换，称为 `resolve`

```js
var PENDING = 0;
var FULFILLED = 1;
var REJECTED = 2;

function Promise() {
  // 存储状态:PENDING, FULFILLED or REJECTED
  var state = PENDING;

  // 存储在完成状态返回的value或拒绝状态返回的error
  var value = null;

  // 存储 成功 或 失败 的handlers(会被 .then 或 .done 调用)
  var handlers = [];

  function fulfill(result) {
    state = FULFILLED;
    value = result;
  }

  function reject(error) {
    state = REJECTED;
    value = error;
  }

  function resolve(result) {
    try {
      var then = getThen(result);
      if (then) {
        doResolve(then.bind(result), resolve, reject)
        return
      }
      fulfill(result);
    } catch (e) {
      reject(e);
    }
  }
}
```

注意 resolve 接受一个Promise或普通值，如果是Promise，则等待它完成(complete)。一个Promise永远不能被另一个Promise触发fulfilled，因此我们将使用这个方法，而不是 暴露内部方法fulfill。我们还使用了一些工具方法(helper methods),让我们来看看怎么实现它们：

```js
/**
 * 检查 value 是否是一个Promise，如果是，
 * 返回这个Promise的then方法。否则返回null
 *
 * @param {Promise|Any} value
 * @return {Function|Null}
 */
function getThen(value) {
  var t = typeof value;
  if (value && (t === 'object' || t === 'function')) {
    var then = value.then;
    if (typeof then === 'function') {
      return then;
    }
  }
  return null;
}

/**
 * 使用一个可能不正常的 resolver 并确保
 * onFulfilled 和 onRejected 只被调用一次。
 *
 * 不保证异步。
 *
 * @param {Function} fn 可能是个不可信的Function
 * @param {Function} onFulfilled
 * @param {Function} onRejected
 */
function doResolve(fn, onFulfilled, onRejected) {
  var done = false;
  try {
    fn(function (value) {
      if (done) return
      done = true
      onFulfilled(value)
    }, function (reason) {
      if (done) return
      done = true
      onRejected(reason)
    })
  } catch (ex) {
    if (done) return
    done = true
    onRejected(ex)
  }
}
```

## 构造 (Constructing)
我们现在已经拥有了完整的内部的状态机，但是我们还没有提供一个调用resolve的方法或者观察方法。让我们从添加Promise的resolving方法开始。

```js
var PENDING = 0;
var FULFILLED = 1;
var REJECTED = 2;

function Promise(fn) {
    // 存储状态:PENDING, FULFILLED or REJECTED
  var state = PENDING;

  // 存储在完成状态返回的value或拒绝状态返回的error
  var value = null;

  // 存储 成功 或 失败 的handlers(会被 .then 或 .done 调用)
  var handlers = [];

  function fulfill(result) {
    state = FULFILLED;
    value = result;
  }

  function reject(error) {
    state = REJECTED;
    value = error;
  }

  function resolve(result) {
    try {
      var then = getThen(result);
      if (then) {
        doResolve(then.bind(result), resolve, reject)
        return
      }
      fulfill(result);
    } catch (e) {
      reject(e);
    }
  }

  doResolve(fn, resolve, reject);
}
```

如你所见，我们只是重用了doResolve方法，但不是直接调用fn。
那是因为我们有另一个不可信的resolver--`fn`， 它被允许多次调用 `resolve` 和 `reject`，甚至可以抛出异常。我们有责任确保Promise只被 resolved 或 resolved 一次，且不会 **再次** 转换成另一个状态(在一个Promise中)。

## 观察者 (通过 .done)

我们现在有了一个完整的状态机，但是我们仍然无法观察到它的任何变化。我们的最终目标是实现.then,但是.done的语义要简单得多，所以我们先来实现它。
我们的目标是完成Promise.done(onFulfilled, onRejected)方法:
- 
-只有一个 `onFulfilled` 或一个 `onFulfilled` 被调用
-该方法只被调用一次
-在下一个tick(即.done方法返回)前都不会被调用。
-无论Promise是否resolved， .done都能被调用

```js
var PENDING = 0;
var FULFILLED = 1;
var REJECTED = 2;

function Promise(fn) {
  // 存储状态:PENDING, FULFILLED or REJECTED
  var state = PENDING;

  // 存储在完成状态返回的value或拒绝状态返回的error
  var value = null;

  // 存储 成功 或 失败 的handlers(会被 .then 或 .done 调用)
  var handlers = [];

  function fulfill(result) {
    state = FULFILLED;
    value = result;
    handlers.forEach(handle);
    handlers = null;
  }

  function reject(error) {
    state = REJECTED;
    value = error;
    handlers.forEach(handle);
    handlers = null;
  }

  function resolve(result) {
    try {
      var then = getThen(result);
      if (then) {
        doResolve(then.bind(result), resolve, reject)
        return
      }
      fulfill(result);
    } catch (e) {
      reject(e);
    }
  }

  function handle(handler) {
    if (state === PENDING) {
      handlers.push(handler);
    } else {
      if (state === FULFILLED &&
        typeof handler.onFulfilled === 'function') {
        handler.onFulfilled(value);
      }
      if (state === REJECTED &&
        typeof handler.onRejected === 'function') {
        handler.onRejected(value);
      }
    }
  }

  this.done = function (onFulfilled, onRejected) {
    // 确保我们总是异步的
    setTimeout(function () {
      handle({
        onFulfilled: onFulfilled,
        onRejected: onRejected
      });
    }, 0);
  }

  doResolve(fn, resolve, reject);
}
```

我们确保priomise在resloved 或 rejected时( when the Promise is resolved or rejected )通知（调用）handlers。我们也只会在接下来的时间里（next tick）做这件事。

## 观察者 (通过 .then)
现在我们已经实现了.done，我们便可以很容易地实现.then。无非是在方法体中构建一个新的Promise。


```js
this.then = function (onFulfilled, onRejected) {
  var self = this;
  return new Promise(function (resolve, reject) {
    return self.done(function (result) {
      if (typeof onFulfilled === 'function') {
        try {
          return resolve(onFulfilled(result));
        } catch (ex) {
          return reject(ex);
        }
      } else {
        return resolve(result);
      }
    }, function (error) {
      if (typeof onRejected === 'function') {
        try {
          return resolve(onRejected(error));
        } catch (ex) {
          return reject(ex);
        }
      } else {
        return reject(error);
      }
    });
  });
}
```

## 延伸阅读

- [then/promise](https://github.com/then/promise/blob/master/src/core.js) 以非常相似的方式实现Promise.
- [kriskowal/q](https://github.com/kriskowal/q/blob/v1/design/README.md) Promise的一个非常不同的实现，以及它背后的设计原则的一个非常好的方式.
- [petkaantonov/bluebird](https://github.com/petkaantonov/bluebird) 专为高性能实现的Promise(使用了秘制配方). 这个 [Optimization Killers](https://github.com/petkaantonov/bluebird/wiki/Optimization-killers) Wiki页面能给予你一些帮助.
- [Stack Overflow](http://stackoverflow.com/questions/23772801/basic-javascript-promise-implementation-attempt/23785244#23785244) 是这篇文章的原始来源