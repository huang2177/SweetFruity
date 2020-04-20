// pages/personInfo/personInfo.js
var isManager = false
const db = wx.cloud.database()
const util = require('../../utils/util.js')
const userInfo = require('../../utils/userInfo.js')

Page({

  onShareAppMessage: function (options) {
    const nickName = wx.getStorageSync('nickName')
    return {
      path: '/pages/index/index',
      title: '您的好友' + (nickName ? nickName : '') + '邀您体验「果味缘」',
    };
  },

  onLoad() {
    const that = this
    that.setData({
      bgImage: that.getBgImage(),
    })
  },

  onShow: function () {
    const that = this
    const nickName = wx.getStorageSync('nickName')
    const avatarUrl = wx.getStorageSync('avatarUrl')
    const phoneNumber = wx.getStorageSync('phoneNumber')
    that.setData({
      items: that.getItemsData(isManager),
      nickName: nickName ? nickName : '点击登录',
      phoneNumber: phoneNumber ? phoneNumber : '获取手机号码',
      avatarUrl: avatarUrl ? avatarUrl : "../image/head.png",
    })

    that.updateBackendInfo()
  },

  /**
   * 获取管理员电话列表
   */
  updateBackendInfo: function () {
    var that = this
    var managerPhones = []
    const phone = that.data.phoneNumber
    db.collection('backendManager').get({
      success: function (res) {
        managerPhones = res.data[0].managerPhones
        isManager = managerPhones.indexOf(phone) >= 0
        if (isManager) {
          that.setData({
            items: that.getItemsData(isManager),
          })
        }
      }
    })
  },

  /**
   * item点击事件
   */
  onItemClick: function (e) {
    const that = this
    const index = e.target.dataset.index
    const pageUrl = e.target.dataset.pageurl
    switch (index) {
      case 2:
        wx.makePhoneCall({
          phoneNumber: '19938237187',
        })
        break;
      default:
        if (that.checkLoginStatus(index)) return

        wx.navigateTo({
          url: pageUrl
        })
        break;
    }
  },

  /**
   * 检查登录状态
   * @param {*} index 
   */
  checkLoginStatus(index) {
    var that = this
    if (index == 0 || index == 1) {
      if ('获取手机号码' == that.data.phoneNumber) {
        wx.showModal({
          title: '提示',
          showCancel: false,
          content: '您还未登录，请登录后重试！',
        })
        return true
      } else if (!wx.getStorageSync('openId')) {
        userInfo.getOpenId()
      }
    }
    return false
  },

  /**
   * 获取用户头像、昵称
   * @param {*} e 
   */
  getUserInfo(e) {
    const that = this
    userInfo.getUserInfo(e, (nickName, avatarUrl) => {
      that.setData({
        nickName: nickName,
        avatarUrl: avatarUrl,
      })
    })
  },

  /**
   * 获取用户手机号码
   * @param {*} e 
   */
  getPhoneNumber(e) {
    const that = this
    userInfo.getPhoneNumber(e, phoneNumber => {
      that.setData({
        phoneNumber: phoneNumber,
      })
      that.updateBackendInfo()
    })
  },

  getBgImage() {
    return [
      '../image/bg1.jpeg',
      '../image/bg2.jpeg',
      '../image/bg3.jpeg',
      '../image/bg4.jpeg',
    ][util.randomInt(4)]
  },

  getItemsData(isManager) {
    const location = wx.getStorageSync('location')
    const data = [{
        url: '../image/menu_order.png',
        text: '我的订单',
        value: '',
        pageUrl: '../userOrder/userOrder'
      },
      {
        url: '../image/menu_location.png',
        text: '收货地址',
        value: location ? location : '未填写!',
        pageUrl: '../locationEdit/locationEdit'
      },
      {
        url: '../image/menu_service.png',
        text: '联系我们',
      },
      {
        backendMenu: true,
        url: '../image/order.png',
        text: '订单管理',
        pageUrl: '../loopOrder/loopOrder'
      },
      {
        backendMenu: true,
        url: '../image/addGoods.png',
        text: '添加商品',
        pageUrl: '../backendHome/backendHome'
      }
    ]
    return isManager ? data : data.splice(0, 3)
  }
})