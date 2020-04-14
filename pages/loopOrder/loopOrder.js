// pages/loopOrder/loopOrder.js
const db = wx.cloud.database()
Page({

  onLoad: function (options) {
    var that = this
    db.collection('orderInfo')
      .orderBy('isCompleted', 'asc')
      .get({
        success: function (res) {
          that.setData({
            orderInfo: res.data,
          })
        },
        fail: function (res) {
          wx.showToast({
            title: '加载失败！',
          })
        }
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