//app.js
const DEV = 'release-ca90l'
const RELEASE = 'dev-3i7nf'
const util = require('utils/util.js')
const shopCarUtil = require('utils/shopCarUtil.js')

App({
  onLaunch: function () {
    this.initDB(RELEASE)
    this.checkUpgrade(true)
    this.getCartsSum(wx.getStorageSync('carts'))
  },

  initDB(env) {
    wx.cloud.init({
      env: env,
      traceUser: true,
    })
  },

  getCartsSum: function (carts) {
    const cartsSum = shopCarUtil.getCartsSum(carts)
    const data = {
      index: 1,
      text: String(cartsSum),
    }
    if (cartsSum) {
      wx.setTabBarBadge(data)
    } else {
      wx.removeTabBarBadge(data)
    }
  },

  checkUpgrade(forceUpgrade) {
    const updateManager = wx.getUpdateManager()
    updateManager.onCheckForUpdate(res => {
      if (!res.hasUpdate) return
      updateManager.onUpdateReady(function () {
        util.showModal('新版本已经准备好，是否重启应用？', !forceUpgrade, () => {
          updateManager.applyUpdate()
        })
      })

      updateManager.onUpdateFailed(function () {
        util.showModal('新版本下载失败，请删除小程序后，重新搜索【果味缘】打开！', false)
      })
    })
  },

  globalData: {
    windowWidth: wx.getSystemInfoSync().windowWidth,
    windowHeight: wx.getSystemInfoSync().windowHeight,
    statusBarHeight: wx.getSystemInfoSync().statusBarHeight,
  }
})