//app.js
const CLOUND_ENV_DEV = 'release-ca90l'
const CLOUND_ENV_RELEASE = 'dev-3i7nf'
const shopCarUtil = require('utils/shopCarUtil.js')

App({
  onLaunch: function () {
    this.initDB()
    this.getCartsSum(wx.getStorageSync('carts'))
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