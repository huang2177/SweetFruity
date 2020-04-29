// pages/loopOrder/loopOrder.js
const db = wx.cloud.database()
Page({

  onLoad: function (options) {
    var that = this
    wx.cloud.callFunction({
      name: 'orderInfo',
      data: {
        action: 'GET',
      }
    }).then(res => {
      that.setData({
        orderInfo: res.result.data,
      })
    }).catch(err => {
      that.setData({
        orderInfo: [],
      })
    })
  },

  call: function (e) {
    const phone = e.target.dataset.phone
    wx.makePhoneCall({
      phoneNumber: phone,
    })
  },

  complete: function (e) {
    const that = this
    const orderId = e.target.dataset.order.orderId
    wx.showModal({
      title: '提示',
      content: '确定该商品已配送？',
      success: function (res) {
        if (!res.cancel) {
          that.updateCompleteStatus(orderId)
        }
      }
    })
  },
  updateCompleteStatus: function (orderId) {
    const that = this
    var currOrder = {}
    const orderInfo = that.data.orderInfo
    orderInfo.forEach(order => {
      if (order['orderId'] == orderId) {
        currOrder = order
      }
    });
    if (currOrder) {
      db.collection("orderInfo")
        .doc(currOrder['_id'])
        .update({
          data: {
            isCompleted: true,
          },
          success: function (res) {
            that.onLoad()
          }
        });
    }
  }
})