// pages/shopCar/shopCar.js

const util = require('../../utils/util.js')
const userInfo = require('../../utils/userInfo.js')
const shopCarUtil = require('../../utils/shopCarUtil.js')
const recommend = require('../../utils/goodsRecommend.js')

Page({

  onShow: function () {
    const that = this
    that.setCarts(wx.getStorageSync('carts'))

    that.setData({
      nickName: wx.getStorageSync('nickName'),
      phoneNumber: wx.getStorageSync('phoneNumber'),
    })

    recommend.getRecommendData('RECOMMEND_GOODS').then(res => {
      that.setData({
        dayRecommend: res.result
      })
    })
  },

  setCarts(carts) {
    const that = this
    that.setData({
      carts: carts ? carts : [],
      totalMoney: (shopCarUtil.getTotalSum(carts).totalMoney).toFixed(2),
    })
    getApp().getCartsSum(carts)
  },

  /**
   * 添加购物车
   */
  addToShopCar(e) {
    var that = this
    shopCarUtil.addToShopCar(e.target.dataset.goodsid, carts => {
      util.showToast()
      that.setCarts(carts)
    })
  },

  /**
   * 移除购物车
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
    shopCarUtil.hasStock().then(() => {
      wx.navigateTo({
        url: '../orderDetail/order'
      })
    }).catch(res => {
      that.showModal('商品【' + res + '】可能已下架，请重新选择!')
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
    userInfo.getUserInfo(e, (nickName, avatarUrl) => {
      that.setData({
        nickName: nickName,
      })
    })
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