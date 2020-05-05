// pages/goodsSearch/goodsSearch.js

const util = require('../../utils/util.js')
const shopCarUtil = require('../../utils/shopCarUtil.js')
const recommend = require('../../utils/goodsRecommend.js')
const goodsManager = require('../../utils/goodsManager.js')

Page({

  data: {
    barHeight: getApp().globalData.statusBarHeight,
  },

  onLoad: function (options) {
    var that = this
    that.setData({
      historySearch: that.getHistorySearch(),
      cartsSum: shopCarUtil.getCartsSum(wx.getStorageSync('carts')),
    })

    recommend.getRecommendData('HOT_SEARCH').then(res => {
      that.setData({
        hotSearch: res.result
      })
    })
  },

  /**
   * 搜索
   */
  bindConfirm(e) {
    var that = this
    const value = e.detail.value

    that.findSearchGoods(value)
    that.saveHistorySearch(value)
  },

  clickSearchItem(e) {
    var that = this
    const value = e.target.dataset.value

    that.findSearchGoods(value)
    that.saveHistorySearch(value)
  },


  findSearchGoods(value) {
    var that = this
    goodsManager.searchGoods(value).then(res => {
      that.setData({
        showHistory: false,
        searchData: res.result,
      })
      res.result.forEach(goods => {
        recommend.updateRecommend(goods.goodsId, 'RECOMMEND_SEARCH', value)
      })
    })
  },

  /**
   * 添加购物车
   */
  addToShopCar(e) {
    var that = this
    shopCarUtil.addToShopCar(e.target.dataset.goodsid, carts => {
      util.showToast()
      that.setData({
        cartsSum: shopCarUtil.getCartsSum(carts),
      })
    })
  },

  /**
   * 跳转购物车
   */
  navigateToShopCar() {
    wx.switchTab({
      url: '../shopCar/shopCar',
    })
  },

  /**
   * 预览图片
   */
  previewImage: function (e) {
    const url = e.target.dataset.url
    wx.previewImage({
      current: url,
      urls: [url]
    })
  },

  saveHistorySearch(value) {
    var that = this
    const historySearch = that.getHistorySearch()

    if (value.length > 0 && historySearch.indexOf(value) < 0) {
      historySearch.unshift(value)
      that.setData({
        historySearch: historySearch,
      })
      wx.setStorageSync('historySearch', historySearch)
    }
    that.setData({
      inputValue: value,
    })
  },

  getHistorySearch() {
    const historySearchS = wx.getStorageSync('historySearch')
    return historySearchS ? historySearchS.splice(0, 6) : []
  },

  bindFocus() {
    this.setData({
      showHistory: true,
    })
  },

  goBack() {
    wx.navigateBack({
      delta: 1,
    })
  }
})