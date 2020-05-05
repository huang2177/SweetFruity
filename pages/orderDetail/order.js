var orderId = ''
var comments = ''
var index = [0, 0]
const db = wx.cloud.database()
const util = require('../../utils/util.js')
const shopCarUtil = require('../../utils/shopCarUtil.js')
const goodsRecommend = require('../../utils/goodsRecommend.js')

Page({
  data: {
    deliveryWay: '未选择',
    deliveryTime: '未选择',
    deliveryWays: ['商家配送', '到店自取'],
    multiArray: [
      ['今天', '明天'], util.getCustomTimes(),
    ],
  },

  onLoad: function () {
    const that = this
    const carts = wx.getStorageSync('carts')
    const totalMoney = (shopCarUtil.getTotalSum(carts).totalMoney).toFixed(2)

    that.setData({
      goodsList: carts,
      totalMoney: totalMoney,
      totalSum: shopCarUtil.getTotalSum(carts).totalSum,
      userInfo: {
        nickName: wx.getStorageSync('nickName'),
        avatarUrl: wx.getStorageSync('avatarUrl'),
        phoneNumber: wx.getStorageSync('phoneNumber'),
      }
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
    var deliveryTime
    try {
      var that = this
      const array = that.data.multiArray
      deliveryTime = util.getDateStr(index[0]) + ' ' + array[1][index[1]]
    } catch (error) {
      util.uploadErrorInfo(db, 'uploadOrderInfo', error)
    }
    db.collection('orderInfo').add({
      data: {
        orderId: orderId,
        isCompleted: false,
        comments: comments,
        deliveryTime: deliveryTime,
        orders: that.data.goodsList,
        userInfo: that.data.userInfo,
        totalMoney: that.data.totalMoney,
        deliveryWay: that.data.deliveryWay,
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

  bindMultiPickerChange(e) {
    var that = this
    index = e.detail.value
    const day = that.data.multiArray[0][index[0]]
    const time = that.data.multiArray[1][index[1]]
    if (!util.inDeliveryTime(day, time)) {
      util.showModal('所选时间不在配送时间范围内，请重新选择！')
      return
    }
    that.setData({
      deliveryTime: '预计 ' + day + time + ' 送达',
    })
  },

  onCommentInput(e) {
    comments = e.detail.value
  },

  updateLocation() {
    util.navigateTo('locationEdit/locationEdit')
  },

  isValidOrderInfo() {
    return this.data.deliveryTime != '未选择' &&
      this.data.deliveryWay != '未选择' &&
      this.data.userInfo.location != '未填写收货地址！'
  },
})