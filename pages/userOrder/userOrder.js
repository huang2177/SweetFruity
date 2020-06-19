const db = wx.cloud.database()
const userInfo = require('../../utils/userInfo.js')

Page({

  onLoad: function (options) {
    const that = this
    that.getUserOrderByOpenId()
  },

  getUserOrderByOpenId() {
    const that = this
    // db.collection('orderInfo').where({
    //     _openid: wx.getStorageSync('openId')
    //   })
    //   .orderBy('isCompleted', 'asc')
    //   .orderBy('createTime', 'asc')
    //   .get({
    //     success: function (res) {
    //       that.setData({
    //         orderInfo: res.data,
    //       })
    //     }
    //   })

    wx.cloud.callFunction({
      name: 'orderInfo',
      data: {
        action: 'GET_USER',
      }
    }).then(res => {
      that.setData({
        orderInfo: res.result.data,
      })
      wx.hideLoading()
    }).catch(err => {
      that.setData({
        orderInfo: [],
      })
      wx.hideLoading()
    })
  }
})