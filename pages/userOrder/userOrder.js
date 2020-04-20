const db = wx.cloud.database()

Page({

  onLoad: function (options) {
    var that = this
    wx.showLoading({
      title: '加载中…',
    })
    wx.cloud.callFunction({
      name: 'orderInfo',
      data: {
        action: 'GET',
        openId: wx.getStorageSync('openId')
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
  },
})