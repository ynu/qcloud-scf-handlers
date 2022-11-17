/**
 * 腾讯云-SCF云函数请求处理程序
 * 使用SCF作为企业微信的消息接收端时，可使用此请求处理器完成基本的处理，包括：
 *    - get请求: 完成验证（默认）
 *    - post请求: 不做处理(默认)
 *    - 其他请求: 不做处理(默认)
 */

 import { verifyUrl } from 'wecom-common';
 import Debug from 'debug';
 
 const info = Debug('wecom-ops-log:info');
 const debug = Debug('wecom-ops-log:debug');
 // const warn = Debug('wecom-ops-log:warn');
 
 // 默认的GET请求处理程序，进行服务器验证
 const defaultGet = (queryString, options) => {
   const { echostr /* , nonce, timestamp, msg_signature */ } = queryString;
   debug(`收到GET请求,进行URL验证, echostr::${echostr}`);
   return verifyUrl(echostr, options);
 };
 
 const defaultPost = () => {
   info('当前API请求为:POST, 暂不处理');
   return {
     isBase64Encoded: false,
     statusCode: 200,
     headers: {},
     body: 'pass-http-post',
   };
 };
 
 const defaultOthers = (httpMethod) => {
   info(`当前API请求为:${httpMethod}, 暂不处理`);
   return {
     isBase64Encoded: false,
     statusCode: 200,
     headers: {},
     body: 'pass-other-http-method',
   };
 };
 
 /**
  * 企业微信消息处理函数
  * @param {Object} methodHandlers 根据http方法区分的处理函数
  * 使用SCF作为企业微信的消息接收端时，可使用此请求处理器完成基本的处理，包括：
  *    - get请求: 完成验证（默认）
  *    - post请求: 不做处理(默认)
  *    - 其他请求: 不做处理(默认)
  * @param {Object} options 验证服务器及解析消息时需要使用的参数
  *    - encoding_aes_key
  * @returns http请求处理函数(接收参数:(event, context))
  */
 export const wecomHttpHandler = (methodHandlers = {}, options = {}) => {
   const get = methodHandlers.get || defaultGet;
   const post = methodHandlers.post || defaultPost;
   const { others } = methodHandlers.others || defaultOthers;
   return async (event) => {
     const { queryString, body, httpMethod } = event;
     switch (httpMethod) {
       case 'GET':
         return get(queryString, options);
       case 'POST':
         info('收到POST请求,处理系统消息');
         return post(body, options);
       default:
         return others(httpMethod);
     }
   };
 };
 
 export default {
   wecomHttpHandler,
 };
 