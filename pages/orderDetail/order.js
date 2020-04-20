var count = 0
const db = wx.cloud.database()
const util = require('../../utils/util.js')
const goodsDBUtil = require('../../utils/goodsDBUtil.js')
const shopCarUtil = require('../../utils/shopCarUtil.js')

Page({
  data: {
    multiIndex: [0, 0, 0],
    deliveryTime: '未选择',
    multiArray: [
      ['今天', '明天'],
      ['上午', '下午'],
      ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30']
    ],
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
    const locationS = wx.getStorageSync("location")
    const location = locationS ? locationS : '未填写收货地址！'
    that.setData({
      location: location,
    })
  },

  updateLocation: function () {
    wx.navigateTo({
      url: '../locationEdit/locationEdit'
    })
  },

  //提交订单
  commitOrder: function () {
    var that = this
    if (!that.isValidLocation()) {
      wx.showModal({
        title: '提示',
        content: '还未填写收货地址！',
        success: function (res) {
          if (!res.cancel) {
            that.updateLocation()
          }
        },
      })
      return
    }
    if (that.data.deliveryTime == '未选择') {
      wx.showModal({
        title: '提示',
        content: '还未选择配送时间！',
      })
      return
    }
    wx.showLoading()
    const orderId = util.randomWord()
    wx.cloud.callFunction({
      name: "pay",
      data: {
        orderid: orderId,
        money: Number(that.data.totalMoney) * 100,
      },
      success(res) {
        wx.hideLoading()
        that.pay(res.result)
        that.setData({
          orderId: orderId
        })
      },
      fail(res) {
        console.log(res)
        wx.hideLoading()
        wx.showModal({
          title: '提示',
          content: '订单提交失败，是否重新提交?',
          showCancel: true,
          success: function (res) {
            if (!res.cancel) {
              that.commitOrder()
            }
          },
        })
      }
    })
  },

  //实现小程序支付
  pay(payData) {
    var that = this
    wx.requestPayment({
      timeStamp: payData.timeStamp,
      nonceStr: payData.nonceStr,
      package: payData.package, //统一下单接口返回的 prepay_id 格式如：prepay_id=***
      signType: 'MD5',
      paySign: payData.paySign, //签名
      success(res) {
        that.uploadOrderInfo()
        that.showSuccessDialog()
        that.updateGoodsStockNum()
        shopCarUtil.clearShopCar()
      },
      fail(res) {
        wx.showModal({
          title: '提示',
          content: '订单支付失败，是否重新支付?',
          showCancel: true,
          success: function (res) {
            if (!res.cancel) {
              that.pay(payData)
            }
          },
        })
      }
    })
  },

  updateGoodsStockNum() {
    var that = this
    var goodsList = that.data.goodsList
    if (count < goodsList.length) {
      goodsDBUtil.updateGoodsStockNum(goodsList[count]['goodsId'], goodsList[count]['sum'], any => {
        count++
        setTimeout(function () {
          that.updateGoodsStockNum()
        }, 1000)
      })
    }
  },

  uploadOrderInfo: function () {
    var that = this
    const userInfo = {
      location: wx.getStorageSync("location"),
      nickName: wx.getStorageSync('nickName'),
      avatarUrl: wx.getStorageSync('avatarUrl'),
      phoneNumber: wx.getStorageSync('phoneNumber'),
    }
    const index = that.data.multiIndex
    const array = that.data.multiArray
    const deliveryTime = util.getDateStr(index[0]) + ' ' + array[1][index[1]] + ' ' + array[2][index[2]]
    const data = {
      isCompleted: false,
      userInfo: userInfo,
      orderId: that.data.orderId,
      orders: that.data.goodsList,
      totalMoney: (that.data.totalMoney),
      comments: that.data.comments,
      deliveryTime: deliveryTime,
      createTime: new Date().getTime(),
    }

    db.collection('orderInfo')
      .add({
        data: data,
        success: function (res) {
          console.log('订单信息上传成功：' + res)
        },
        fail: function (res) {
          console.log('订单信息上传失败：' + res)
        }
      })
  },

  showSuccessDialog: function () {
    wx.showModal({
      title: '提示',
      content: '支付成功，我们会尽快为您配送，请耐心等。',
    })
    this.setData({
      isPaySuccess: true
    })
  },

  bindMultiPickerChange: function (e) {
    const index = e.detail.value
    const multiArray = this.data.multiArray
    this.setData({
      multiIndex: index,
      deliveryTime: '预计 ' + multiArray[0][index[0]] + multiArray[1][index[1]] + multiArray[2][index[2]] + ' 送达',
    })
  },

  bindMultiPickerColumnChange: function (e) {
    const value = e.detail.value
    const column = e.detail.column
    if (column != 1) {
      return
    }
    var multiArray = []
    if (value == 0) { //上午
      multiArray = [
        ['今天', '明天'],
        ['上午', '下午'],
        ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30']
      ]
    } else {
      multiArray = [
        ['今天', '明天'],
        ['上午', '下午'],
        ['01:00', '01:30', '02:00', '02:30', '03:00', '03:30', '04:00', '04:30', '05:00', '05:30', '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00']
      ]
    }
    this.setData({
      multiArray: multiArray,
    })
  },

  onCommentInput: function (e) {
    this.setData({
      comments: e.detail.value,
    })
  },

  isValidLocation: function () {
    return this.data.location && this.data.location != '未填写收货地址！'
  },
})