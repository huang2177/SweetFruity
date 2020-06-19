// pages/shopCar/shopCar.js

const util = require('../../utils/util.js')
const shopCarUtil = require('../../utils/shopCarUtil.js')
const recommend = require('../../utils/goodsRecommend.js')

const msgUtil = require('../../utils/messageUtil.js')
Page({

  onTabItemTap() {
    //msgUtil.requestSendMsg()
  },

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
    const money = shopCarUtil.getTotalSum(carts).totalMoney
    that.setData({
      enableCommit: money < 10,
      carts: carts ? carts : [],
      totalMoney: money.toFixed(2),
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
    util.showModal('确定清空购物车吗？', true, function () {
      shopCarUtil.clearShopCar(that.setCarts)
    })
  },

  /**
   * 跳转到订单详情
   */
  jumpToOrderPage: function () {
    var that = this
    if (!util.isLogin()) {
      util.showModal('您还未登录，请登录【昵称、手机号码】后重试！', true, () => {
        that.navigate(null, '../personInfo/personInfo')
      })
      return
    }
    shopCarUtil.hasStock().then(() => {
      util.navigateTo('orderDetail/order')
    }).catch(res => {
      util.showModal('商品【' + res + '】可能已下架，请重新选择!')
    })
  },

  /**
   * 跳转到首页
   */
  navigate(e, url = '../index/index') {
    wx.switchTab({
      url: url,
    })
  },
})