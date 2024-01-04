---
title: 从Kafka的零拷贝说起
date: 2024/01/03
categories: 
 - 随笔
tags: 
- 技术
---

## Kafka的零拷贝

Kafka相对于其他消息队列（MQ）系统而言被认为较快的原因有很多。其中一个关键的性能优势就是零拷贝技术的应用。零拷贝是一种通过减少内存复制来提高数据传输性能的技术，对于Kafka的设计有着重要的影响。在Kafka中，零拷贝的实现允许消息在传输过程中最小化内存复制，从而提高了整体性能。

> We expect a common use case to be multiple consumers on a topic. Using the zero-copy optimization above, data is copied into pagecache exactly once and reused on each consumption instead of being stored in memory and copied out to user-space every time it is read. This allows messages to be consumed at a rate that approaches the limit of the network connection.

> For more background on the sendfile and zero-copy support in Java, see this [article](https://developer.ibm.com/articles/j-zerocopy/).

通过零拷贝技术，消费者可以将消息直接传输到内存中，避免了数据从内核空间复制到用户空间的过程。生产者将消息追加到磁盘上的日志文件上。

## RabbitMQ能用吗？

与Kafka不同，RabbitMQ 是一个基于 AMQP（Advanced Message Queuing Protocol）的消息队列系统，它着重于**提供可靠的消息传递服务**。

尽管 Kafka 和 RabbitMQ 都支持消息的持久化，但它们的设计理念和底层实现方式不同，这导致它们在持久化方案和数据结构上存在差异。



rabbitmq的消息体存储格式，不允许它读取磁盘数据后直接传输给客户端。这样的设计导致在消息传递中**涉及更多的磁盘 I/O 操作 和 内存操作 **，所以它并不能使用零拷贝技术。

作为对比，Kafka采用顺序写磁盘的方式来存储消息。这意味着生产者产生的消息按照它们的写入顺序被追加到磁盘上的日志文件中。这种顺序存储的方式有助于提高磁盘的顺序读写性能，也帮助了使用零拷贝技术来辅助消息传递性能。


## 还有什么让我们忽略了？

那么如果 RabbitMQ 修改了存储的数据结构使得可以直接传给消费者，RabbitMQ 是否能使用到【零拷贝】技术呢？

答案是否定的，因为零拷贝技术的一个前提是**消息的不可变性**，即一旦消息被创建，就不会再被修改。由于 RabbitMQ 允许消息包含消费状态，并且支持确认和拒绝消息的操作，这可能导致消息在消费过程中会发生数据变化。所以，即使 RabbitMQ 修改了存储的数据结构使得可以直接传给消费者，RabbitMQ 依旧不能使用到【零拷贝】技术。



那么kafka的设计理念是什么呢？它用简单的消息模型来保证**消息的不可变性**，用另外的更加依赖客户端的方式来保证了消息的消费与重试。



## 总结

通过对比Kafka和RabbitMQ的零拷贝技术应用和设计理念，我们可以得出结论：

- **Kafka的零拷贝技术**在大规模数据流处理中表现出色，通过最小化内存复制提高了消息传输的效率。其顺序存储和分区设计使得零拷贝更易于应用，特别是在高吞吐量场景下。
- **RabbitMQ注重可靠的消息传递服务**，强调持久性和一致性。其设计允许消息包含消费状态，但这也可能导致在传递过程中消息的变化，从而不适合直接应用零拷贝技术。