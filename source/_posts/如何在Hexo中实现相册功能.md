---
title: 如何在Hexo中实现自适应响应式相册功能
date: 2018/02/18
thumbnail: http://o7o8kqz7a.bkt.clouddn.com/image/180224/iKhLJDE8mH.png
tags: 
- Hexo
- 教程
- 随笔
---

用最清晰简洁的方法整合一个响应式相册
![示意图](/blogimg/25.png)
<!-- more -->
[效果](https://fchange.github.io/photo/)

## 技术选型
- 由于我选用的主题使用了fancyBox作为图片弹出展示的框架，查看后表示很不错，能满足需要 
[http://fancyapps.com/fancybox/3/](http://fancyapps.com/fancybox/3/)
- 图片加载可能会太慢，所以还需要一个图片延迟加载插件 [Lazyload](https://github.com/tuupola/jquery_lazyload)
- 想使用瀑布流作为展示，粗略了解了下，便使用开源的[MiniGrid](https://github.com/henriquea/minigrid)，原因是它很小巧也刚好满足需求(ps:它的文档让我看了很捉急,不完善的文档是个大坑)

## 相册文件夹
按照Hexo官方给的[建议](https://hexo.io/zh-cn/docs/asset-folders.html)
> 资源（Asset）代表 source 文件夹中除了文章以外的所有文件，例如图片、CSS、JS 文件等。比方说，如果你的Hexo项目中只有少量图片，那最简单的方法就是将它们放在 source/images 文件夹中。然后通过类似于 `![](/images/image.jpg)` 的方法访问它们。
> 对于那些想要更有规律地提供图片和其他资源以及想要将他们的资源分布在各个文章上的人来说，Hexo也提供了更组织化的方式来管理资源。这个稍微有些复杂但是管理资源非常方便的功能可以通过将 config.yml 文件中的 `post_asset_folder` 选项设为 `true` 来打开。

``` javaScript
    post_asset_folder: true

```

然后就可以在文件夹`source`下新建一个相册文件夹`Images`,将照片放入这个文件夹

## 相册页面
我们需要一个相册页面以加载所有照片

```Html

---
title: 相册
noDate: 'true'
---
<script src="https://cdn.bootcss.com/jquery_lazyload/1.9.7/jquery.lazyload.js"></script>
<script src="https://unpkg.com/minigrid@3.1.1/dist/minigrid.min.js"></script>

<div class="ImageGrid"></div>

<script src="/js/photo.js"></script>
```
这里使用`noDate`来自定义一些HTML数据，加载一些JS文件(minigrid在bootcss中还是1.*的版本，只好使用它推荐的cdn了)，其中`photo.js`是自定义的，用来加载照片，稍后提到。
现在，我们就有一个相册页面了，接下来的问题是怎么批量加载那些照片。

## 脚本
大家可以集思广益，我是用的是一个[教程](https://www.cnblogs.com/xljzlw/p/5137622.html)中的脚本改的，与其思路一致。
在博客主文件夹下新建`tool.js`：
``` javaScript
"use strict";
    const fs = require("fs");
    const sizeOf = require('image-size');
    const path = "./source/Images";
    const outputfile = "./source/Images/output.json";
    var dimensions;

    fs.readdir(path, function (err, files) {
        if (err) {
            return;
        }
        let arr = [];
        (function iterator(index) {
            if (index == files.length) {
                fs.writeFile(outputfile, JSON.stringify(arr, null, "\t"));
                return;
            }

            fs.stat(path + "/" + files[index], function (err, stats) {
                if (err) {
                    return;
                }
                if (stats.isFile()) {
                    dimensions = sizeOf(path + "/" + files[index]);
                    console.log(dimensions.width, dimensions.height);
                    arr.push(dimensions.width + '.' + dimensions.height + ' ' + files[index]);
                }
                iterator(index + 1);
            })
        }(0));
    });
```
每次在相册中更新照片后都要在控制台`node tool.js`一下，以便更新数据。
它会生成一个json文件，带有每张照片的长宽及文件名。
需要它的宽高是因为我们需要它满足瀑布流样式。
output.json样式类似于：
``` javasScript
[
    "3120.4160 发票.jpg",
    "516.516 头像.jpg",
    "402.180 录音.jpeg",
    "720.758 截图1.jpg",
    "720.978 截图2.jpg"
]
```

## photo.js
``` javaScript
photo ={
    page: 1,
    offset: 20,
    init: function () {
        var that = this;
        $.getJSON("/photo/output.json", function (data) {
            that.render(that.page, data);
            //that.scroll(data);
        });
    },

    render: function (page, data) {
        var begin = (page - 1) * this.offset;
        var end = page * this.offset;
        if (begin >= data.length) return;
        var html, li = "";
        for (var i = begin; i < end && i < data.length; i++) {

            li += '<div class="card">' +
                    '<div class="ImageInCard">' + 
                      '<a data-fancybox="gallery" href="/Images/' + data[i] + '">' +
                        '<img src="/Images/' + data[i] + '"/>' +
                      '</a>' +
                    '</div>' +
                    '<div class="TextInCard">'+data[i].split('.')[0]+'</div>' +
                  '</div>' 

        }

        $(".ImageGrid").append(li);
        $(".ImageGrid").lazyload();
        this.minigrid();
    },

    minigrid: function() {
        var grid = new Minigrid({
            container: '.ImageGrid',
            item: '.card',
            gutter: 12
        });
        grid.mount();
        $(window).resize(function() {
           grid.mount();
        });
    }

}

photo.init();
```

js文件也可以放在Images文件夹下，只需要将相册页面加载的`<script src="/js/photo.js"></script>`改成`<script src="/Images/photo.js"></script>`即可。

## css
这个样式是我自己写的，大家可以按照自己的想法自行更改：

``` CSS
.ImageGrid {width: 100%;max-width: 1040px;margin: 0 auto; text-align: center;}
.card {overflow: hidden;transition: .3s ease-in-out; border-radius: 8px; background-color: #ddd;}
.ImageInCard {}
.ImageInCard img {padding: 0 0 0 0;}
.TextInCard {line-height: 54px; background-color: #ffffff; font-size: 24px;}
```

## 自动构建
我是使用过[travis-ci](https://www.travis-ci.org/)自动构建的。（用过以后表示很鸡肋）
如果你也使用了这个的话，在`travis.yml`中的`script`或者`before_script`,添加一句`node tool.js`,就可以将相册脚本也加入自动构建：

``` javaScript
script:
  - node tool.js
  - hexo g
```

