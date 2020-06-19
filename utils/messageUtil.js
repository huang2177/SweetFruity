const utils = require('./util.js')

function requestSendMsg() {
  wx.requestSubscribeMessage({
    tmplIds: ['ZzGB3RSqN21wZSicGOfaz4nLHQ7-3s5aNA9bVPPKytY'],
    //'X2nrG_rW1C2O8JRYzO-gnrqfm9Sg2MX2Adrxh6FeBWw',
  })
}

function sendPurchaseMsg(goodsList, money) {
  var title = ''
  goodsList.forEach(goods => {
    title += goods.text + ' x' + goods.sum + '、'
  })
  if (title.length > 20) {
    title = title.substring(0, 16) + '...'
  } else {
    title = title.substring(0, title.length - 1)
  }

  wx.cloud.callFunction({
    name: 'sendMessage',
    data: {
      action: 'PURCHASE',
      text: title,
      money: money,
    }
  })
}

function sendGroupedSuccessMsg(_id, orders) {
  console.log(orders)
  orders.forEach(order => {
    if (order.orders[0]._id == _id) {
      wx.cloud.callFunction({
        name: 'sendMessage',
        data: {
          action: 'GROUPED_SUCCESS',
          text: order.orders[0].text,
          money: order.totalMoney,
          openid: order._openid
        }
      })
    }
  })
}

module.exports = {
  requestSendMsg: requestSendMsg,
  sendPurchaseMsg: sendPurchaseMsg,
  sendGroupedSuccessMsg: sendGroupedSuccessMsg
}