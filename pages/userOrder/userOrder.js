const db = wx.cloud.database()
const userInfo = require('../../utils/userInfo.js')

Page({

  onLoad: function (options) {
    const that = this
    const openId = wx.getStorageSync('openId')
    wx.showLoading({
      title: '加载中…',
    })
    if (!openId) {
      userInfo.getOpenId(_openId => {
        that.getUserOrderByOpenId(_openId)
      })
    } else {
      that.getUserOrderByOpenId(openId)
    }
  },

  getUserOrderByOpenId(openId) { 
    const that = this
    wx.cloud.callFunction({
      name: 'orderInfo',
      data: {
        action: 'GET',
        openId: openId
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