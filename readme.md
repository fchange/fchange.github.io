### 博客常规操作

#### hexo clean

清除缓存文件，配置修改时需要使用。

#### hexo generate / hexo g

生效新增、修改、更新的文件
hexo generate --watch #监视文件变动

#### hexo server / hexo s

启动本地网站，可在本地观察网站效果

#### hexo deploy / hexo d

hexo 的一键部署功能，执行此命令即可将网站发布到配置中的仓库地址。

#### hexo new [layout] < title >

新建一篇文章，layout 参数可选，title 必填。

#### hexo new page < title >

新建页面

#### hexo debug

用于调试异常

### 其他

#### npm install 插件 --save

安装 hexo 所需插件，具体插件可以参考[HEXO 插件](https://hexo.io/plugins/)。

#### 主题美化

具体参考:[打造个性超赞博客 Hexo+NexT+GithubPages 的超深度优化](https://reuixiy.github.io/technology/computer/computer-aided-art/2017/06/09/hexo-next-optimization.html)

#### 改变环境

”_config.yml“，“theme/”，“source/"，“scaffolds/”，“package.json”，".gitignore"是必须拷贝的。
具体或其他方法，参考知乎问题:[使用 hexo，如果换了电脑怎么更新博客？
](https://www.zhihu.com/question/21193762)

> 使用 hexo 的血泪教训是:不要太纠结配置外观
> 使用 markdown 的血泪教训是:一定要把握好什么地方该敲空格，什么地方不能敲,听上去简单，用了就知道有多坑了 🌚。

