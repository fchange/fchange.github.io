---
title: 一个简明CAP定理介绍 （翻译）
date: 2018/11/09
categories: 
 - 翻译集
tags: 
 - 翻译
---

翻译自http://ksat.me ， [原文链接](http://ksat.me/a-plain-english-introduction-to-cap-theorem/)。


我想你会经常听到CAP定理，在设计分布式系统时，它点出了技术上的“天花板”。与我的大多数其他入门教程一样，让我们通过将CAP与实际情况进行比较来理解它。

## 第一章: “Remembrance 公司” 你的新公司 :

昨晚当你的妻子夸赞你记住了她的生日并给她送了一份礼物时，你突然想到一个有趣的点子。人们在记东西方面总是差强人意。而你在这方面又很很很好。那么，何不开一家能发挥你这种天赋的公司呢？你越想就越喜欢这个主意，你甚至想出了一个报纸广告来推广你的idea。

> Remembrance 公司! - 永远不会忘记,  即使没有记忆！
> 你曾因为忘记太多东西而感到伤心难过吗? 别担心。现在只要打个电话就能得到帮助!
>
> 当你需要记住一样东西, 只需拨打 131- * * * * ，然后告诉我们你想记住什么. 比如：打电话给我们，告诉我们你老板的电话号码，然后当你忘记了它有迫切的想要记起来的时候，打回同一个电话，我们就会告诉你，你老板的电话号码。
>
> 费用 : 每个请求只需要0.1美元

所以，你的电话对话都将会是这样的:

- 顾客 : 嘿，你能帮我记住邻居的生日吗?
- 你: OK。。是哪一天呢？
- 顾客 : 一月二号
- 你: (把它写在客户专属的那页纸笔记本上)已记录。现在您可以随时打电话告诉询问我们你邻居的生日!
- 顾客 : 谢谢!
- 你: 没问题!我们将从你的信用卡收取0.1美元


## 第二章: 公司扩张:

你的公司得到 YCombinator 的资助。你的想法很简单，只需要一个纸笔记本和一个电话，然而却如此有效，业务像野火一样蔓延开来。你开始每天接到数百个电话。

这就造成了个问题。你发现越来越多的顾客不得不排队等着和你说话。
他们中的大多数人甚至厌倦了等待的氛围而挂断了电话。另外，前几天你生病了，不能来上班，你损失了一整天的生意。
更不用说那些不满意的客户了，他们想要当天的信息。
于是你决定是时候扩大规模让你的妻子来帮助你了。

从一个简单的计划开始:
- 你和你的妻子各持有一个分机
- 客户仍然可以拨打 131- * * * *，并且只需要记住这一个数字
- 专用的交换机会把客户的电话平均得路由到每个人的分机上。

## 第三章: 你的第一个“差评” :

在你实施新系统两天后，你接到了你的老客户Jhon的电话。事情是这样的:

- Jhon: Hey
- 你: 很高兴你打电话给“Remembrance 公司”。我能为您效劳吗?
- Jhon: 你能告诉我去新德里的航班是什么时候吗?
- 你: 可以. .请给我1秒种时间，先生。
- (你开始查你的笔记本)
- (哇!在Jhon的那一页上没有“航班”的信息)!!!!!
- 你: 先生，我想你是弄错了。你从没告诉过我们你去德里的航班的信息。
- Jhon: 什么!我昨天刚给你们打电话!(愤怒得挂掉电话!)
- 这是怎么回事呢? Jhon 会说谎吗?你想了一会儿，便知道了原因!你妻子昨天接到 Jhon 的电话了吗?你去你妻子的桌子上看看她的笔记本。果然就在那里。你把这个告诉你的妻子，她也意识到了问题。
 
你的分布式设计有那么严重的缺陷!**你的分布式系统不一致（consistent）! 客户随时都有可能更新一些东西，这些东西可能是你记录，也可能是你的妻子记录，当下一个客户的电话被转到另一个人的时候，Remembrance 公司就不能提供一致（consistent）的回复了**

## 第四章: 解决一致性（Consistency）问题:

嗯，你的竞争对手可能会忽略这一次糟糕的服务，但你不会。当你妻子睡觉的时候，你整晚都躺在床上，然后早上想出一个漂亮的计划。你叫醒你的妻子，告诉她:
”亲爱的，我们从现在开始这样做“

-每当我们中的任何一个人接到电话要求更新(当客户想让我们记住某件事)时，我们都会在电话结束前告诉对方，这样我们双方都能记下所有更新
-当需要搜索时(当客户需要他已经存储的信息时)，我们不需要和其他人交谈。由于我们两个人都有最新的笔记本电脑信息，所以我们只能参考一下。

There is only one problem though, you say, and that is an “update” request has to involve both of us and we cannot work in parallel during that time. For eg. when you get an update request and telling me to update too, i cannot take other calls. But that’s okay because most calls we get anyway are “search” (a customer updates once and asks many times) . Besides, we cannot give wrong information at any cost.

“Neat” your wife says, “but there is one more flaw in this system that you haven’t thought of. What if one of us doesn’t report to work on a particular day? On that day, then, we won’t be able to take “any” Update calls, because the other person cannot be updated! We will have **Availability problem , i.e, for eg., if an update request comes to me I will never be able to complete that call because even though I have written the update in my note book, I can never update you. So I can never complete the call!”**
 

## Chapter 5: You come up with the greatest solution Ever:
You being to realize a little bit on why distributed system might not be as easy as you thought at first. Is it that difficult to come up with a solution that could be both **“Consistent and Available”**? Could be difficult for others, but not for you!! Then next morning you come up with a solution that your competitors cannot think of in their dreams! You wake your wife up eagerly again..

” look” , you tell her.. “This is what we can do to be consistent and available” . The plan is mostly similar to what I told you yesterday:

1. Whenever any one of us get a call for an update(when the customer wants us to remember something) before completing the call, if the other person is available we tell the other person. This way both of us note down any updates
2. But if the other person is not available(doesn’t report to work) we send the other person an email about the update.
3. The next day when the other person comes to work after taking a day off, He first goes through all the emails, updates his note book accordingly.. before taking his first call.
4. Genius! You wife says! I can’t find any flaws in this systems. Let’s put it to use.. Remembrance Inc! is now both **Consistent and available**!
 

## Chapter 6: Your wife gets angry :
Everything goes well for a while. Your system is consistent. Your system works well even when one of you doesn’t report to work. But what if Both of you report to work and one of you doesn’t update the other person? Remember all those days you’ve been waking your wife up early with your Greatest-idea-ever-bullshit? * What if your wife decides to take calls but is too angry with you and decides not to update you for a day? Your idea totally breaks! Your idea so far is good for consistency and availability but is not Partition Tolerant!*
You can decide to be partition tolerant by deciding not to take any calls until you patch up with your wife.. Then your system will not be “available” during that time…
 

## Chapter 7: Conclusion :
So Let’s look at CAP Theorem now. Its states that, when you are designing a distributed system you can get cannot achieve all three of Consistency, Availability and Partition tolerance. You can pick only two of:

Consistency: You customers, once they have updated information with you, will always get the most updated information when they call subsequently. No matter how quickly they call back
Availability: Remembrance Inc will always be available for calls until any one of you(you or your wife) report to work.
Partition Tolerance: Remembrance Inc will work even if there is a communication loss between you and your wife!
 
## Bonus : Eventual Consistency with a run around clerk :
Here is another food for thought. You can have a run around clerk, who will update other’s notebook when one of your’s or your wife’s note books is updated. The greatest benefit of this is that, he can work in background and one of your or your wife’s “update” doesn’t have to block, waiting for the other one to update. This is how many NoSql systems work, one node updates itself locally and a background process synchronizes all other nodes accordingly… The only problem is that you will lose consistency of some time. For eg., a customer’s call reaches your wife first and before the clerk has a chance to update your notebook , the customer’ calls back and it reaches you. Then he won’t get a consistent reply.. But that said, this is not at all a bad idea if such cases are limited. For eg., assuming a customer won’t forget things so quickly that he calls back in 5 minutes.

That’s CAP and eventual consistency for you in simple english :)