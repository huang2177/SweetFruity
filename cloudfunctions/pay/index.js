//云开发实现支付
const cloud = require('wx-server-sdk')
cloud.init()

//1，引入支付的三方依赖
const tenpay = require('tenpay');
//2，配置支付信息
const config = {
  appid: 'wx18f037768b93d004',
  mchid: '1577900361',
  partnerKey: 'HOY85H2AG4HOUCKUGG6HVCMP3XAPJY8C',
  notify_url: 'https://mp.weixin.qq.com/',
  spbill_create_ip: '127.0.0.1',
  trade_type: 'JSAPI',
};

exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext()
  let {
    orderid,
    money,
    goddsDesc,
  } = event
  //3，初始化支付
  const api = tenpay.init(config, true);

  let result = await api.getPayParams({
    out_trade_no: orderid,
    body: '果味缘-中海国际水果店',
    total_fee: money,
    openid: wxContext.OPENID,
    trade_type: 'JSAPI',
  })
  return result;
}