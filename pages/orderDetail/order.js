var count = 0
var orderId = ''
var comments = ''
var index = []
const db = wx.cloud.database()
const util = require('../../utils/util.js')
const goodsDBUtil = require('../../utils/goodsDBUtil.js')
const shopCarUtil = require('../../utils/shopCarUtil.js')
const goodsRecommend = require('../../utils/goodsRecommend.js')

Page({
  data: {
    deliveryWay: '未选择',
    deliveryTime: '未选择',
    index: [0, 0],
    multiArray: [
      ['今天', '明天'],
      util.getCustomTimes(),
    ],
    deliveryWays: ['商家配送', '到店自取']
  },

  onLoad: function (options) {
    count = 0
    const that = this
    const carts = wx.getStorageSync('carts')
    const totalMoney = (shopCarUtil.getTotalSum(carts).totalMoney).toFixed(2)

    that.setData({
      goodsList: carts,
      totalMoney: totalMoney,
      nickName: wx.getStorageSync('nickName'),
      phoneNumber: wx.getStorageSync('phoneNumber'),
      totalSum: shopCarUtil.getTotalSum(carts).totalSum,
    })
  },

  onShow() {
    const that = this
    const location = wx.getStorageSync("location")
    that.setData({
      location: location ? location : '未填写收货地址！',
    })
  },

  /**
   * 提交订单
   */
  commitOrder: function () {
    var that = this
    if (!that.isValidOrderInfo()) {
      that.showModal('请填写完整订单信息，以便商家配送')
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
    }).catch(err => {
      console.log(err)
      wx.hideLoading()
      that.showModal('订单提交失败，请稍后重试！')
    })
  },

  /**
   * 实现小程序支付
   * @param {订单数据} payData 
   */
  requestPay(payData) {
    var that = this
    wx.requestPayment({
      signType: 'MD5',
      paySign: payData.paySign, //签名
      package: payData.package, //统一下单接口返回的 prepay_id 格式如：prepay_id=***
      nonceStr: payData.nonceStr,
      timeStamp: payData.timeStamp,
    }).then(res => {
      that.showModal('支付成功，我们会尽快为您配送，请耐心等!')
      that.uploadOrderInfo()
      that.updateOtherInfo()
      shopCarUtil.clearShopCar()
    }).catch(err => {
      that.showModal('订单支付失败，请稍后重试！')
    })
  },

  /**
   * 上传订单信息
   */
  uploadOrderInfo: function () {
    var that = this
    const array = that.data.multiArray
    const deliveryTime = util.getDateStr(index[0]) + ' ' + array[1][index[1]]
    const userInfo = {
      location: wx.getStorageSync("location"),
      nickName: wx.getStorageSync('nickName'),
      avatarUrl: wx.getStorageSync('avatarUrl'),
      phoneNumber: wx.getStorageSync('phoneNumber'),
    }

    db.collection('orderInfo').add({
      data: {
        orderId: orderId,
        isCompleted: false,
        comments: comments,
        userInfo: userInfo,
        deliveryTime: deliveryTime,
        orders: that.data.goodsList,
        totalMoney: that.data.totalMoney,
        deliveryWay: that.data.deliveryWay,
        createTime: new Date().toLocaleString,
      }
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
    const index = e.detail.value
    that.setData({
      deliveryWay: that.data.deliveryWays[index]
    })
  },

  bindMultiPickerChange: function (e) {
    var that = this
    index = e.detail.value
    const day = that.data.multiArray[0][index[0]]
    const time = that.data.multiArray[1][index[1]]
    if (!util.inDeliveryTime(day, time)) {
      that.showModal('所选时间不在配送时间范围内，请重新选择！')
      return
    }
    that.setData({
      deliveryTime: '预计 ' + day + time + ' 送达',
    })
  },

  onCommentInput: function (e) {
    comments = e.detail.value
  },
  updateLocation() {
    wx.navigateTo({
      url: '../locationEdit/locationEdit',
    })
  },

  isValidOrderInfo: function () {
    return this.data.deliveryTime != '未选择' &&
      this.data.deliveryWay != '未选择' &&
      this.data.location != '未填写收货地址！'
  },

  showModal(content, showCancel = false) {
    wx.showModal({
      title: '提示',
      content: content,
      showCancel: showCancel
    })
  }
})