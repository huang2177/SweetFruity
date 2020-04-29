//app.js
const CLOUND_ENV_DEV = 'release-ca90l'
const CLOUND_ENV_RELEASE = 'dev-3i7nf'
const shopCarUtil = require('utils/shopCarUtil.js')

App({
  onLaunch: function () {
    this.initDB()
    this.getCartsSum(wx.getStorageSync('carts'))
    //https://6465-dev-3i7nf-1301412224.tcb.qcloud.la/1587906451000.jpg?sign=c03719875ab84e4a8eaf8ffe1a4347c1&t=1588001416
    //cloud://dev-3i7nf.6465-dev-3i7nf-1301412224/1587906451000.jpg
  },

  initDB() {
    wx.cloud.init({
      traceUser: true,
      env: CLOUND_ENV_RELEASE,
    })
  },

  getCartsSum: function (carts) {
    const cartsSum = shopCarUtil.getCartsSum(carts)
    if (cartsSum > 0) {
      wx.setTabBarBadge({
        index: 1,
        text: String(cartsSum),
      })
    } else {
      wx.removeTabBarBadge({
        index: 1,
      })
    }
  },

  globalData: {
    windowWidth: wx.getSystemInfoSync().windowWidth,
    windowHeight: wx.getSystemInfoSync().windowHeight,
    statusBarHeight: wx.getSystemInfoSync().statusBarHeight,
  }
})