# qcloud-scf-handlers
一般情况下，当我们对微信消息进行接收处理时，会用到“云函数+API网关”的架构。此时，我们需要定义SCF中的`main_handler`函数。`qc-scf-handlers`中定义了一些函数作为预定义的`main_handler`。

## 安装
`npm i qcloud-scf-handlers`

## API
### wecomHttpHandler([methodHandlers, options])
`wecomHttpHandler` 定义了一个一般的处理企业消息的HTTP处理程序，默认对`GET`、`POST`请求进行处置，而对其他类型的请求则直接返回200.

#### 返回值
返回一个`handler(event, context)`函数作为`main_handler`

#### 参数
- `methodHandlers` 可选，针对不同HTTP请求的处理程序，默认不做任何处理直接返回200。
  - `get(queryString, options)`，可选，默认进行服务器验证。
    - `queryString` 查询字符串
    - `options` 企业微信相关参数
  - `post(body, options)` 对接收到的消息进行处理，默认不做任何处理，直接返回200
- `options` 可选，企业微信相关参数，默认由环境变量中读取。具体参见`wecom-common`

#### 示例
```
exports.main_handler = async (event, context) => {
  // 腾讯云SCF使用CommonJS架构，因此只能使用import()加载包
  const { wecomHttpHandler } = await import('qcloud-scf-handlers');

  // 读取企业微信参数
  const { 运维日志appCfg } = await import('./utils.mjs');

  // 自定义的POST处理函数
  const { post } = await import('./http-method-dispatcher.mjs');
  const handler = wecomHttpHandler({
    post,
  }, 运维日志appCfg);
  return handler(event, context);
};
```


### wecomMessageHttpHandler([msgTypeHandlers = {}, options = {}])
`wecomMessageHttpHandler`在`wecomHttpHandler`的基础上更进一步，根据企业微信发送的消息的类型（例如`event`、`text`等）进行了处理。

#### 返回值
返回一个`handler(event, context)`函数作为`main_handler`

#### 参数
- `msgTypeHandlers` 可选，针对不同的MsgType进行处理，默认不做任何处理，直接返回200
  - *消息类型*(`message`) 处理特定消息，默认不处理
    - `message` 消息体
- `options` 可选，企业微信相关参数，默认由环境变量中读取。至少应该包括:
  - `encoding_aes_key` 用户解密接收到的消息。具体参见`wecom-common`

#### 示例
```
exports.main_handler = async (event/* , context */) => {
  const { wecomMessageHttpHandler } = await import('qcloud-scf-handlers');
  const { 运维日志appCfg } = await import('./utils.mjs');
  const msgTypeHandlers = await import('./msg-type-dispatcher.mjs');
  const handler = wecomMessageHttpHandler({
    event: msgTypeHandlers.event,
  }, 运维日志appCfg);
  return handler(event);
};
```