---
title: 有趣的斐波那契数列
date: 2019/06/28
categories: 
 - 随笔
tags: 
- leetcode
---

在尝试刷动态规划相关题目时，从leetcode拿简单题开始切入，便遇到了一个有趣的题目和解答方案，让我耳目一新。

题目： [爬楼梯题目](https://leetcode-cn.com/problems/climbing-stairs/)， 是个最基础的斐波那契数列相关题目，最简单的解法，无非就是递归。

``` java
class Solution {
    public int climbStairs(int n) {
        if(n == 1) return 1;
        if(n == 2) return 2;
        return climbStairs(n - 1) + climbStairs (n - 2);
    }
}
```

提交时发现超时了，因为递归会消耗很多堆栈资源，所以尝试使用更 **朴素** 的方式。

```java
class Solution {
    public int climbStairs(int n) {
		if(n == 0) return 0;
		if(n == 1) return 1;
		if(n == 2) return 2;

		int one = 1;
		int two = 2;
		int three = 0;
		for (int i = 3; i <= n; i++) {
			three = one + two;
			one = two;
			two = three;
		}
		return three;
	}
}
```

[链接 https://leetcode-cn.com/submissions/detail/21591778/](https://leetcode-cn.com/submissions/detail/21591778/)

这回提交后通过了。但是，我有看到执行用时更短的提交用例，查看源码发现，愣是看！不！懂！

```java
class Solution {
    public int climbStairs(int n) {
        double sqrt_5 = Math.sqrt(5);
        double fib_n = Math.pow((1+sqrt_5)/2, n + 1) - Math.pow((1-sqrt_5)/2, n + 1);
        return (int)(fib_n / sqrt_5);
    }
}
```

不知道其根号五是从何而来，又有何用处。

查阅wikipedia  [https://zh.wikipedia.org/wiki/斐波那契数列](https://zh.wikipedia.org/wiki/斐波那契数列), 找到了我想要的答案:

![篇幅较长，所以使用截图展示](/blogimg/1561951531908.png)

这一套花哨的操作，只用到了高中数学的知识。成功算出了 $a_n$ 的表达式。

对着表达式：

![表达式](/blogimg/fib.svg)

现在再看其源码便能看出端倪。
```java
class Solution {
    public int climbStairs(int n) {
        double sqrt_5 = Math.sqrt(5);
        double fib_n = Math.pow((1+sqrt_5)/2, n + 1) - Math.pow((1-sqrt_5)/2, n + 1);
        return (int)(fib_n / sqrt_5);
    }
}
```

这无非是直接套入公式，算出n对应的斐波那契值。

所以，编程实现斐波那契，不一定非要用递归循环等方式，还可以直接使用公式算出其对应的值（这样时间复杂度就降到了O（1）)。数学思想才是超脱于编程实现的存在。