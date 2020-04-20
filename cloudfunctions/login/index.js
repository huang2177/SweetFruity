const cloud = require('wx-server-sdk')
cloud.init()

exports.main = (event, context) => {
  const wxContext = cloud.getWXContext()
  const action = event.action
  var data = {}
  switch (action) {
    case 'openId':
      data = {
        openId: wxContext.OPENID,
      }
      break;
    case 'phoneNumber':
      data = {
        event,
        openId: wxContext.OPENID,
      }
      break;
  }
  return data
}