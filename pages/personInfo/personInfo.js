// pages/personInfo/personInfo.js
const db = wx.cloud.database()
const util = require('../../utils/util.js')
const userInfo = require('../../utils/userInfo.js')

var isManager = false

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
    that.setBgImage()
    that.updateItems()
    that.updateBackendInfo()
  },

  onShow: function () {
    const that = this
    const nickName = wx.getStorageSync('nickName')
    const avatarUrl = wx.getStorageSync('avatarUrl')
    const phoneNumber = wx.getStorageSync('phoneNumber')
    that.setData({
      nickName: nickName ? nickName : '点击登录',
      avatarUrl: avatarUrl ? avatarUrl : "../image/head.png",
      phoneNumber: that.hidePhoneCenterNumberIfNotNull(phoneNumber),
    })
  },

  updateItems() {
    const that = this
    that.setData({
      items: that.getItemsData(isManager),
    })
  },

  setBgImage() {
    this.setData({
      bgImage: util.randomBgImage()
    })
  },

  /**
   * 获取管理员电话列表
   */
  updateBackendInfo: function () {
    var that = this
    db.collection('backendManager').get().then(res => {
      const phone = wx.getStorageSync('phoneNumber')
      const managerPhones = res.data[0].managerPhones
      isManager = managerPhones.indexOf(phone) >= 0
      if (isManager) that.updateItems()
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
      }
    }
    return false
  },

  /**
   * 获取用户头像、昵称
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
   */
  getPhoneNumber(e) {
    const that = this
    userInfo.getPhoneNumber(e, phoneNumber => {
      that.setData({
        phoneNumber: that.hidePhoneCenterNumberIfNotNull(phoneNumber),
      })
      that.updateBackendInfo()
    })
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
  },

  hidePhoneCenterNumberIfNotNull(phone) {
    if (phone && phone.length == 11) {
      return phone.substring(0, 3) + ' **** ' + phone.substring(7, 11)
    }
    return '获取手机号码'
  },

})