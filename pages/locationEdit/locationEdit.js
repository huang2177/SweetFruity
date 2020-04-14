// pages/locationEdit/locationEdit.js
Page({

  data: {
    location: '',
    placeHolder: '',
    hasDefaultLocation: false,
  },

  onLoad: function(options) {
    var title = options.location ? '修改收货地址' : '添加收货地址'
    var isValidLocation = options.location && options.location != '未填写收货地址！'
    var placeHolder = isValidLocation ? options.location : '请输入收货地址：'

    this.setData({
      placeHolder: placeHolder,
      hasDefaultLocation: isValidLocation,
    })
    wx.setNavigationBarTitle({
      title: title
    })
  },

  onInputContent: function(e) {
    this.setData({
      location: e.detail.value,
    })
  },

  onSaveLocation: function() {
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];
    var location = this.data.location
    if (!location) {
      wx.showModal({
        title: '提示',
        content: '请填写有效的收货地址！',
        showCancel: false,
      })
      return
    }
    wx.setStorageSync("location", location)
    prevPage.setData({
      location: location,
    })
    wx.navigateBack({
      delta: 1,
    })
  },

  isValidLocation: function(location) {
    return location && location != '未填写收货地址！'
  },

})