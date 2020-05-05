// pages/locationEdit/locationEdit.js
const util = require('../../utils/util.js')
var location = wx.getStorageSync("location")

Page({

  onLoad() {
    this.setData({
      defaultLocation: location
    })
  },

  onInputContent(e) {
    location = e.detail.value
  },

  bindconfirm() {
    if (!location) {
      util.showModal('请填写有效的收货地址！')
      return
    }
    wx.setStorageSync("location", location)
    var pages = getCurrentPages();
    var prepage = pages[pages.length - 2];
    if (prepage.updateItems) prepage.updateItems()

    wx.navigateBack({
      delta: 1,
    })
  },

})