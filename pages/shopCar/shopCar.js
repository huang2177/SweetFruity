// pages/shopCar/shopCar.js
const db = wx.cloud.database()
const userInfo = require('../../utils/userInfo.js')
const shopCarUtil = require('../../utils/shopCarUtil.js')

Page({

  onLoad: function (options) {
    var that = this
    wx.onAppHide((res) => {
      wx.setStorageSync('carts', that.data.carts)
    })
    that.getGoodsListData()
  },

  onShow: function () {
    const that = this
    that.setData({
      nickName: wx.getStorageSync('nickName'),
      phoneNumber: wx.getStorageSync('phoneNumber'),
    })

    that.setCarts(wx.getStorageSync('carts'))
  },

  setCarts(carts) {
    const that = this
    that.setData({
      totalMoney: (shopCarUtil.getTotalSum(carts).totalMoney).toFixed(2),
      carts: carts ? carts : [],
    })
  },

  getGoodsListData(fun) {
    const that = this
    db.collection("goodsListData").get({
      success: function (res) {
        if (fun) fun(res.data)

        res.data.forEach(goods => {
          if ('每日促销' == goods['text']) {
            that.setData({
              dayRecommend: goods.content
            })
          }
        })
      },
    })
  },

  /**
   * 添加购物车
   * @param {*} e 
   */
  addToShopCar(e) {
    var that = this
    that.getGoodsListData(data => {
      shopCarUtil.addToShopCar(data, e.target.dataset.goodsid, that.setCarts)
    })
  },

  /**
   * 移除购物车
   * @param {*} goodsId 
   */
  removeFromShopCar(e) {
    var that = this
    const goodsId = e.target.dataset.goodsid
    shopCarUtil.removeFromShopCar(goodsId, that.setCarts)
  },

  /**
   * 跳转到订单详情
   */
  jumpToOrderPage: function () {
    if (this.hasCarts()) {
      wx.navigateTo({
        url: '../orderDetail/order'
      })
    }
  },

  /**
   * 跳转到首页
   */
  navigateToHome() {
    wx.switchTab({
      url: '../index/index',
    })
  },

  getUserInfo(e) {
    if (this.hasCarts()) {
      userInfo.getUserInfo(e, this.onShow)
    }
  },

  getPhoneNumber(e) {
    userInfo.getPhoneNumber(e, this.jumpToOrderPage)
  },

  hasCarts() {
    var that = this
    if (that.data.carts.length == 0) {
      wx.showModal({
        title: '提示',
        showCancel: false,
        content: '您还没有选择任何商品！',
      })
    }
    return that.data.carts.length != 0
  }

})