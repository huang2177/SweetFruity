// pages/locationEdit/locationEdit.js
var location = ''

Page({

  onLoad: function (options) {
    this.setData({
      defaultLocation: wx.getStorageSync("location")
    })
  },

  onInputContent: function (e) {
    location = e.detail.value
  },

  bindconfirm: function () {
    if (!location) {
      wx.showModal({
        title: '提示',
        content: '请填写有效的收货地址！',
      })
      return
    }
    wx.setStorageSync("location", location)
    var pages = getCurrentPages();
    var prepage = pages[pages.length - 2];
    prepage.updateItems()

    wx.navigateBack({
      delta: 1,
    })
  },

})