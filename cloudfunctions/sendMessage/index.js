const cloud = require('wx-server-sdk')
cloud.init()
exports.main = async (event) => {
  const text = event.text
  const amount = event.money
  const action = event.action
  switch (action) {
    case 'PURCHASE':
      return await cloud.openapi.subscribeMessage.send({
        touser: cloud.getWXContext().OPENID,
        page: 'pages/userOrder/userOrder',
        lang: 'zh_CN',
        data: {
          "thing1": {
            "value": text
          },
          "amount7": {
            "value": amount
          },
          "date4": {
            "value": new Date().toLocaleString()
          }
        },
        templateId: 'X2nrG_rW1C2O8JRYzO-gnrqfm9Sg2MX2Adrxh6FeBWw',
        miniprogramState: 'formal'
      })
      break;
    case 'GROUPED_SUCCESS':
      return await cloud.openapi.subscribeMessage.send({
        touser: event.openid,
        page: 'pages/userOrder/userOrder',
        lang: 'zh_CN',
        data: {
          "thing1": {
            "value": text
          },
          "amount6": {
            "value": amount
          },
          "thing4": {
            "value": '你已拼团成功，商家会尽快为你配送，如需其他时间点配送，请进入小程序联系商家！'
          }
        },
        templateId: 'ZzGB3RSqN21wZSicGOfaz4nLHQ7-3s5aNA9bVPPKytY',
        miniprogramState: 'formal'
      })
      break;

    default:
      break;
  }
}