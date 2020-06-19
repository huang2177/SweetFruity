var orderId = ''
var comments = ''
const db = wx.cloud.database()
const util = require('../../utils/util.js')
const shopCarUtil = require('../../utils/shopCarUtil.js')
const goodsManager = require('../../utils/goodsManager.js')
const goodsRecommend = require('../../utils/goodsRecommend.js')
Page({
  data: {
    deliveryWay: '未选择',
    deliveryWays: ['商家配送', '到店自取'],
  },

  onLoad: function (e) {
    const that = this
    that.setData({
      totalSum: 1,
      userInfo: {
        nickName: wx.getStorageSync('nickName'),
        avatarUrl: wx.getStorageSync('avatarUrl'),
        phoneNumber: wx.getStorageSync('phoneNumber'),
      }
    })
    goodsManager.getGroupData().then(res => {
      res.result.data.forEach(group => {
        if (e.id == group.id) that.setPageData(group)
      })
    })
  },

  setPageData(group) {
    this.setData({
      group: group,
      totalMoney: Number(group.unitPrice).toFixed(2),
    })
  },

  onShow() {
    const that = this
    const userInfo = that.data.userInfo
    userInfo.location = wx.getStorageSync("location") ?
      wx.getStorageSync("location") :
      '未填写收货地址！'
    that.setData({
      userInfo: userInfo,
    })
  },

  /**
   * 创建订单
   */
  createOrder: function () {
    var that = this
    if (!that.isValidOrderInfo()) {
      util.showModal('请填写完整订单信息，以便商家配送')
      return
    }

    wx.showLoading()
    orderId = util.randomWord()
    wx.cloud.callFunction({
      name: "pay",
      data: {
        orderid: orderId,
        money: Number(that.data.totalMoney) * 100,
      },
    }).then(res => {
      wx.hideLoading()
      that.requestPay(res.result)
    }).catch(error => {
      console.log(error)
      wx.hideLoading()
      util.showModal('订单提交失败，请稍后重试!')
      util.uploadErrorInfo(db, 'createOrder', error)
    })
  },

  /**
   * 实现小程序支付
   */
  requestPay(payData) {
    var that = this
    wx.requestPayment({
      signType: 'MD5',
      paySign: payData.paySign,
      package: payData.package,
      nonceStr: payData.nonceStr,
      timeStamp: payData.timeStamp,
      success: () => {
        util.showModal('支付成功，我们会尽快为您配送，请耐心等!')
        that.uploadOrderInfo()
        that.updateOtherInfo()
        shopCarUtil.clearShopCar()
      },
      fail: (error) => {
        util.showModal('订单支付失败，请稍后重试!')
        util.uploadErrorInfo(db, 'requestPay', error)
      }
    })
  },

  /**
   * 上传订单信息
   */
  uploadOrderInfo: function () {
    var that = this
    db.collection('orderInfo').add({
      data: {
        isGroup: true, // 拼团购买
        orderId: orderId,
        isCompleted: false,
        comments: comments,
        orders: [that.data.group],
        userInfo: that.data.userInfo,
        totalMoney: that.data.totalMoney,
        deliveryWay: that.data.deliveryWay,
        deliveryTime: that.data.group.closeTime,
        createTime: new Date().toLocaleString(),
      }
    }).catch(err => {
      util.uploadErrorInfo(db, 'uploadOrderInfo', err)
    })
  },

  /**
   * 更新其他信息
   */
  updateOtherInfo() {
    var that = this
    that.data.goodsList.forEach(goods => {
      goodsRecommend.updateRecommend(goods.goodsId, 'RECOMMEND_BUY')
    })
    that.setData({
      isPaySuccess: true
    })
  },

  bindPickerChange(e) {
    var that = this
    that.setData({
      deliveryWay: that.data.deliveryWays[e.detail.value]
    })
  },

  onCommentInput(e) {
    comments = e.detail.value
  },

  updateLocation() {
    util.navigateTo('locationEdit/locationEdit')
  },

  isValidOrderInfo() {
    return (this.data.deliveryWay == '到店自取' ||
      this.data.deliveryWay == '商家配送' && this.data.userInfo.location != '未填写收货地址！')
  },
})