zeaho-ci适于公司内部上传、预览二维码并将发送至企业微信，可供测试扫码，提升开发效率

## 安装

### npm安装

```bash
$ npm install -g zeaho-ci
```

### yarn安装

```bash
$ yarn global add zeaho-ci
```

## 使用

zeaho-ci是一个基于Node的工具模块，使用前我们需要先初始化一下，让其生成配置文件。我们需要先准备两样东西：

1. 微信小程序的小程序代码上传密钥，参考[官方文档](https://developers.weixin.qq.com/miniprogram/dev/devtools/ci.html#%E5%AF%86%E9%92%A5%E5%8F%8A-IP-%E7%99%BD%E5%90%8D%E5%8D%95%E9%85%8D%E7%BD%AE)获取即可，然后将获取到的`private.你的appid.key`文件将其放置到项目的根目录下；
2. 在项目根目录下创建`temp`文件夹，然后获取到小程序的体验版二维码图片放置在`temp`文件夹下，并命名为`upload.jpg`。

准备好上述的东西之后我们就可以进行初始化了。

### 初始化

```bash
$ zeaho-ci --init
```

或者您可以采用简写的方式

```bash
$ zeaho-ci -i
```

这个时候会在项目的根目录下生成一个`ci.config.json`文件，内容如下：

```json
{
    "enable": true,
    "access_token": "您的access_token",
    "appId": "您的appid",
    "privateKeyPath": "./private.您的appid.key",
    "projectPath": "./dist",
    "project_name": "攻城兵",
    "notification_list": ["wujian"]
}
```

|       字段名        |                           描述                           | 是否必填 |
| :-----------------: | :------------------------------------------------------: | :------: |
|      `enable`       |               是否启用发送通知至企业微信群               |  `true`  |
|   `access_token`    |           企业微信机器人webhook链接后面的token           |  `true`  |
|       `appId`       |                  当前微信小程序的appid                   |  `true`  |
|  `privateKeyPath`   |                  上述提到的密钥文件路径                  |  `true`  |
|    `projectPath`    | 当前项目解析路径，如果是原生小程序则直接填入当前路径即可 |  `true`  |
| `notification_list` |                企业微信消息需要被通知的人                |  `true`  |
|   `project_name`    |                     小程序的项目名称                     |  `true`  |

### 运行

```bash
$ zeaho-ci --start
```

或者使用简写

```bash
$ zeaho-ci -s
```

根据提示来进行操作就可以了，成功后会在企业微信群通知通过机器人发布小程序的二维码以及版本信息。

### 效果预览
![效果图](https://raw.githubusercontent.com/Indexsarrol/image/master/blogs/preview.png)

### 更新记录

- **v1.0.5**(`2020-10-25`)
  1. README文档更新；
  2. 修复输入版本描述消息不展示的问题。
- **v1.0.4**(`2020-10-22`)
  1. 安装工具无法安装依赖问题；
  2. README文档更新。
- **v1.0.3**(`2020-10-21`)
  1. 修复版本号验证不通过的问题；
  2. README文档更新。
- **v1.0.2**(`2020-10-18`)
  1. 增加系列判定条件，支持发送体验版二维码；
  2. 文档更新。
- **v1.0.1**(`2020-10-09`)
  1. 初始化项目，初始化功能。



