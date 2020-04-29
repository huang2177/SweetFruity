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
      carts: carts ? carts : [],
      totalMoney: (shopCarUtil.getTotalSum(carts).totalMoney).toFixed(2),
    })
  },

  getGoodsListData(fun) {
    const that = this
    db.collection("goodsListData").get().then(res => {
      if (fun) fun(res.data)

      res.data.forEach(goods => {
        if ('每日促销' == goods['text']) {
          that.setData({
            dayRecommend: goods.content
          })
        }
      })
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
   * 清空购物车
   */
  clearShopCar() {
    var that = this
    that.showModal('确定清空购物车吗？', true, function () {
      shopCarUtil.clearShopCar(that.setCarts)
    })
  },

  /**
   * 跳转到订单详情
   */
  jumpToOrderPage: function () {
    var that = this
    that.getGoodsListData(data => {
      shopCarUtil.hasStock(data, function () {
          wx.navigateTo({
            url: '../orderDetail/order'
          })
        },
        function (goodsName) {
          that.showModal('商品【' + goodsName + '】可能已下架，请重新选择!')
        })
    })
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
    userInfo.getUserInfo(e, this.onShow)
  },

  getPhoneNumber(e) {
    userInfo.getPhoneNumber(e, this.jumpToOrderPage)
  },

  showModal(content, showCancel = false, fun = null) {
    wx.showModal({
      title: '提示',
      content: content,
      showCancel: showCancel,
      success: function (res) {
        if (res.confirm && fun) fun()
      }
    })
  }
})