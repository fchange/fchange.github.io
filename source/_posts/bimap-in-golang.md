---
title: 什么？Golang的sync不支持重入？
date: 2024/03/15
categories: 
 - 随笔
tags: 
- 技术
---

## 引言

在进行开发过程中，我们常常会遇到需要使用到一些特定数据结构的情况。最近我遇到了一个需求，需要使用到一个BiMap（或称"双向映射"）的数据结构。遗憾的是，Golang官方并没有提供这样的数据结构。可以作为参考的是 guava 的 [BiMap](https://github.com/google/guava/wiki/NewCollectionTypesExplained#bimap)。于是，我决定自己动手实现一个。

作为特殊处理，我这里还涉及到 key -> value set， 所以会是一个带逆向的map[K]map[V]struct{}。

## 实现BiMap
为了实现这个BiMap，我创建了一个名为BiMap的结构体。该结构体内部持有两个map，分别用于键到值和值到键的映射。这样，我就可以通过键或值来进行快速的双向查找。
注意我的实现里用到了泛型。并使用了 comparable 类型约束，这是 Go 1.18 中引入的新特性。如果你使用的是较早版本的 Go，可能需要对类型约束进行适当的修改，或者升级到 Go 1.18 版本以支持 comparable 类型约束。

```golang
package main

import "fmt"

type BiMap[K comparable, V comparable] struct {
	forwardMap  map[K]map[V]struct{}
	backwardMap map[V]K
}

func NewBiMap[K comparable, V comparable]() *BiMap[K, V] {
	return &BiMap[K, V]{
		forwardMap:  make(map[K]map[V]struct{}),
		backwardMap: make(map[V]K),
	}
}

func (bm *BiMap[K, V]) ResetByKey(key K, values ...V) {
	// 删除原有关联的键值对
	oldValues := bm.GetByKey(key)
	for _, value := range oldValues {
		delete(bm.backwardMap, value)
	}

	// 添加新的关联的键值对
	bm.forwardMap[key] = make(map[V]struct{})
	for _, value := range values {
		bm.forwardMap[key][value] = struct{}{}
		bm.backwardMap[value] = key
	}
}

func (bm *BiMap[K, V]) ResetByValue(value V, key K) {
	oldKey, ok := bm.GetByValue(value)
	if !ok || oldKey == key {
		return
	}

	// 删除原有关联的键值对
	delete(bm.backwardMap, value)
	delete(bm.forwardMap[oldKey], value)
	if len(bm.forwardMap[oldKey]) == 0 {
		delete(bm.forwardMap, oldKey)
	}

	// 添加新的关联的键值对
	bm.backwardMap[value] = key
	if _, ok := bm.forwardMap[key]; !ok {
		bm.forwardMap[key] = make(map[V]struct{})
	}
	bm.forwardMap[key][value] = struct{}{}
}

func (bm *BiMap[K, V]) GetByKey(key K) []V {
	values, ok := bm.forwardMap[key]
	if !ok {
		return nil
	}

	result := make([]V, 0, len(values))
	for value := range values {
		result = append(result, value)
	}

	return result
}

func (bm *BiMap[K, V]) GetByValue(value V) (K, bool) {
	key, ok := bm.backwardMap[value]
	return key, ok
}

func main() {
	bimap := NewBiMap[string, int]()

	// 添加键值对
	bimap.ResetByKey("apple", []int{1, 2, 3}...)
	bimap.ResetByKey("banana", []int{4, 5}...)
	bimap.ResetByKey("cherry", []int{6}...)

	// 获取键对应的值
	appleValues := bimap.GetByKey("apple")
	fmt.Println("Values for apple:", appleValues) // Output: Values for apple: [1 2 3]

	// 重置键对应的值
	bimap.ResetByValue(2, "banana")
	updatedAppleValues := bimap.GetByKey("apple")
	updatedBananaValues := bimap.GetByKey("banana")
	fmt.Println("Updated values for apple:", updatedAppleValues)   // Output: Updated values for apple: [1 3]
	fmt.Println("Updated values for banana:", updatedBananaValues) // Output: Updated values for banana: [4 5 2]

	// 添加新的键值对
	bimap.ResetByKey("durian", []int{7, 8}...)
	durianValues := bimap.GetByKey("durian")
	fmt.Println("Values for durian:", durianValues) // Output: Values for durian: [7 8]
}

```

## 引入线程安全性

为了带来线程安全性，我们引入了 sync.RWMutex 类型的 lock 字段，并在相应的方法中使用读写锁来保护并发访问。在读取操作 (GetByKey 和 GetByValue) 中，我们使用 RLock 方法获取读锁，并在完成后使用 RUnlock 方法释放读锁。在写入操作 (ResetByKey 和 ResetByValue) 中，我们使用 Lock 方法获取写锁，并在完成后使用 Unlock 方法释放写锁。
读锁允许多个 Goroutine 同时访问数据，而写锁会独占地进行写入操作。这样可以提高并发性能并防止数据竞争的发生。
```golang
type BiMap[K comparable, V comparable] struct {
	forwardMap  map[K]map[V]struct{}
	backwardMap map[V]K
	lock        sync.RWMutex
}

func NewBiMap[K comparable, V comparable]() *BiMap[K, V] {
	return &BiMap[K, V]{
		forwardMap:  make(map[K]map[V]struct{}),
		backwardMap: make(map[V]K),
	}
}

func (bm *BiMap[K, V]) ResetByKey(key K, values ...V) {
	bm.lock.Lock() // 获取写锁
	defer bm.lock.Unlock()

	// 删除原有关联的键值对
	oldValues := bm.GetByKey(key)
	for _, value := range oldValues {
		delete(bm.backwardMap, value)
	}

	// 添加新的关联的键值对
	bm.forwardMap[key] = make(map[V]struct{})
	for _, value := range values {
		bm.forwardMap[key][value] = struct{}{}
		bm.backwardMap[value] = key
	}
}

func (bm *BiMap[K, V]) ResetByValue(value V, key K) {

	oldKey, ok := bm.GetByValue(value)
	if !ok || oldKey == key {
		return
	}

	bm.lock.Lock() // 获取写锁
	defer bm.lock.Unlock()

	// 删除原有关联的键值对
	delete(bm.backwardMap, value)
	delete(bm.forwardMap[oldKey], value)
	if len(bm.forwardMap[oldKey]) == 0 {
		delete(bm.forwardMap, oldKey)
	}

	// 添加新的关联的键值对
	bm.backwardMap[value] = key
	if _, ok := bm.forwardMap[key]; !ok {
		bm.forwardMap[key] = make(map[V]struct{})
	}
	bm.forwardMap[key][value] = struct{}{}
}

func (bm *BiMap[K, V]) GetByKey(key K) []V {
	bm.lock.RLock() // 获取读锁
	defer bm.lock.RUnlock()

	values, ok := bm.forwardMap[key]
	if !ok {
		return nil
	}

	result := make([]V, 0, len(values))
	for value := range values {
		result = append(result, value)
	}

	return result
}

func (bm *BiMap[K, V]) GetByValue(value V) (K, bool) {
	bm.lock.RLock() // 获取读锁
	defer bm.lock.RUnlock()

	key, ok := bm.backwardMap[value]
	return key, ok
}
```

## sync包的不可重入性问题

此时，重新运行main，程序出现了错误
```shell
fatal error: all goroutines are asleep - deadlock!

goroutine 1 [sync.RWMutex.RLock]:
sync.runtime_SemacquireRWMutexR(0xab3608?, 0x0?, 0xc00007bcd8?)
        .../sdk/go1.21.7/src/runtime/sema.go:82 +0x25
sync.(*RWMutex).RLock(...)
        .../sdk/go1.21.7/src/sync/rwmutex.go:71
main.(*BiMap[...]).GetByKey(0xb63a40, {0xb41e11, 0x5})
        .../main.go:65 +0x8c
main.(*BiMap[...]).ResetByKey(0xb63a40, {0xb41e11, 0x5}, {0xc00007be70, 0x3, 0x100000000})
        .../main.go:26 +0xb8
main.main()
        .../main.go:93 +0xdd

```

这可能让人非常困惑。通过仔细阅读错误消息，我们可以发现，在已经持有写锁的情况下尝试获取读锁时发生了死锁（同样地，在已经持有读锁的情况下尝试获取写锁也会失败）。显然，Golang的原生互斥锁并不支持重入。

### 官方文档解释

深入研究后，我在官方文档的这个链接 https://stackoverflow.com/questions/14670979/recursive-locking-in-go/14671462#14671462 找到了一些解释。

>  the best way how to implement recursive locks in Go is to not implement them, but rather redesign your code to not need them in the first place. It's probable, I think, that the desire for them indicates a wrong approach to some (unknown here) problem is being used.

> Recursive (aka reentrant) mutexes are a bad idea.
The fundamental reason to use a mutex is that mutexes
protect invariants, perhaps internal invariants like
``p.Prev.Next == p for all elements of the ring,'' or perhaps
external invariants like ``my local variable x is equal to p.Prev.''
Locking a mutex asserts ``I need the invariants to hold''
and perhaps ``I will temporarily break those invariants.''
Releasing the mutex asserts ``I no longer depend on those
invariants'' and ``If I broke them, I have restored them.''

## 解决不可重入性问题

现在当我们在一个互斥锁已经被持有的情况下尝试再次获取该锁时，会导致死锁。为了解决这个问题，我们需要重新设计代码，避免对互斥锁的重入需求。

一种常见的方法是使用更细粒度的锁。例如，对于我们的BiMap实现，我们可以使用两个独立的互斥锁来分别保护键到值的映射和值到键的映射。这样，当我们在一个映射上持有锁时，仍然可以在另一个映射上进行操作而不会导致死锁。

另一种方法是重新考虑代码逻辑，避免在持有锁的情况下调用可能导致死锁的函数。这可能需要对代码进行一些重构，以避免重入需求。

这里我们选择用简单的方案，重写 ResetByKey ResetByValue，使他们不在调用 GetByKey GetByValue 即可。

```goalng
func (bm *BiMap[K, V]) ResetByKey(key K, values ...V) {
	bm.lock.Lock() // 获取写锁
	defer bm.lock.Unlock()

	// 删除原有关联的键值对
	oldValues := bm.forwardMap[key]
	for value, _ := range oldValues {
		delete(bm.backwardMap, value)
	}

	// 添加新的关联的键值对
	bm.forwardMap[key] = make(map[V]struct{})
	for _, value := range values {
		bm.forwardMap[key][value] = struct{}{}
		bm.backwardMap[value] = key
	}
}

func (bm *BiMap[K, V]) ResetByValue(value V, key K) {
	bm.lock.Lock() // 获取写锁
	defer bm.lock.Unlock()
	
	oldKey := bm.backwardMap[value]
	if oldKey == key {
		return
	}


	// 删除原有关联的键值对
	delete(bm.backwardMap, value)
	delete(bm.forwardMap[oldKey], value)
	if len(bm.forwardMap[oldKey]) == 0 {
		delete(bm.forwardMap, oldKey)
	}

	// 添加新的关联的键值对
	bm.backwardMap[value] = key
	if _, ok := bm.forwardMap[key]; !ok {
		bm.forwardMap[key] = make(map[V]struct{})
	}
	bm.forwardMap[key][value] = struct{}{}
}
```

### 最终代码
```golang
package main

import (
	"fmt"
	"sync"
)

type BiMap[K comparable, V comparable] struct {
	forwardMap  map[K]map[V]struct{}
	backwardMap map[V]K
	lock        sync.RWMutex
}

func NewBiMap[K comparable, V comparable]() *BiMap[K, V] {
	return &BiMap[K, V]{
		forwardMap:  make(map[K]map[V]struct{}),
		backwardMap: make(map[V]K),
	}
}

func (bm *BiMap[K, V]) ResetByKey(key K, values ...V) {
	bm.lock.Lock() // 获取写锁
	defer bm.lock.Unlock()

	// 删除原有关联的键值对
	oldValues := bm.forwardMap[key]
	for value, _ := range oldValues {
		delete(bm.backwardMap, value)
	}

	// 添加新的关联的键值对
	bm.forwardMap[key] = make(map[V]struct{})
	for _, value := range values {
		bm.forwardMap[key][value] = struct{}{}
		bm.backwardMap[value] = key
	}
}

func (bm *BiMap[K, V]) ResetByValue(value V, key K) {
	bm.lock.Lock() // 获取写锁
	defer bm.lock.Unlock()

	oldKey := bm.backwardMap[value]
	if oldKey == key {
		return
	}

	// 删除原有关联的键值对
	delete(bm.backwardMap, value)
	delete(bm.forwardMap[oldKey], value)
	if len(bm.forwardMap[oldKey]) == 0 {
		delete(bm.forwardMap, oldKey)
	}

	// 添加新的关联的键值对
	bm.backwardMap[value] = key
	if _, ok := bm.forwardMap[key]; !ok {
		bm.forwardMap[key] = make(map[V]struct{})
	}
	bm.forwardMap[key][value] = struct{}{}
}

func (bm *BiMap[K, V]) GetByKey(key K) []V {
	bm.lock.RLock() // 获取读锁
	defer bm.lock.RUnlock()

	values, ok := bm.forwardMap[key]
	if !ok {
		return nil
	}

	result := make([]V, 0, len(values))
	for value := range values {
		result = append(result, value)
	}

	return result
}

func (bm *BiMap[K, V]) GetByValue(value V) (K, bool) {
	bm.lock.RLock() // 获取读锁
	defer bm.lock.RUnlock()

	key, ok := bm.backwardMap[value]
	return key, ok
}

func main() {
	bimap := NewBiMap[string, int]()

	// 添加键值对
	bimap.ResetByKey("apple", []int{1, 2, 3}...)
	bimap.ResetByKey("banana", []int{4, 5}...)
	bimap.ResetByKey("cherry", []int{6}...)

	// 获取键对应的值
	appleValues := bimap.GetByKey("apple")
	fmt.Println("Values for apple:", appleValues) // Output: Values for apple: [1 2 3]

	// 重置键对应的值
	bimap.ResetByValue(2, "banana")
	updatedAppleValues := bimap.GetByKey("apple")
	updatedBananaValues := bimap.GetByKey("banana")
	fmt.Println("Updated values for apple:", updatedAppleValues)   // Output: Updated values for apple: [1 3]
	fmt.Println("Updated values for banana:", updatedBananaValues) // Output: Updated values for banana: [4 5 2]

	// 添加新的键值对
	bimap.ResetByKey("durian", []int{7, 8}...)
	durianValues := bimap.GetByKey("durian")
	fmt.Println("Values for durian:", durianValues) // Output: Values for durian: [7 8]
}

```

## 总结与见解

在本文中，我们讨论了Golang的sync包不支持重入的限制以及相关的问题。

对此，我们应该重新审视代码逻辑，避免在持有锁的情况下调用可能导致死锁的函数。这可能需要对代码进行重构以避免重入需求，并确保正确处理并发访问的情况。

我们都需要选择适当的并发模型和工具来处理并发编程问题的重要性。除了互斥锁外，我们还可以使用其他同步原语或并发安全的数据结构来满足特定的需求。在处理并发编程问题时，需要仔细分析代码，并确保不会引入新的竞态条件或死锁情况。

当然，尽管官方不支持并不提倡重入锁的语义，但仍然有一些开源项目自行实现了支持"可重入"的锁。
例如： 
 - https://github.com/changsongl/reentrant-lock
 - https://github.com/LgoLgo/geentrant