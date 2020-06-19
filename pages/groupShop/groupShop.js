// pages/groupShop/groupShop.js

const util = require('../../utils/util.js')
const msgUtil = require('../../utils/messageUtil.js')
const goodsManager = require('../../utils/goodsManager.js')

Page({

  onTabItemTap() {
    msgUtil.requestSendMsg()
  },

  onShow() {
    var that = this
    goodsManager.getGroupData().then(res => {
      that.setData({
        groupData: res.result.data
      })
    })
  },

  onShareAppMessage() {},

  joinGroup(e) {
    var that = this
    if (!util.isLogin()) {
      util.showModal('您还未登录，请登录【昵称、手机号码】后重试！', true, that.navigate)
      return
    }
    const id = e.currentTarget.dataset.id
    util.navigateTo('groupDetail/groupDetail?id=' + id)
  },

  navigate() {
    wx.switchTab({
      url: '../personInfo/personInfo',
    })
  },

})