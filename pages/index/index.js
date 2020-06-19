//index.js
var goodsList
var isFitRefresh
const util = require('../../utils/util.js')
const shopCarUtil = require('../../utils/shopCarUtil.js')
const goodsManager = require('../../utils/goodsManager.js')
Page({
  data: {
    barHeight: getApp().globalData.statusBarHeight + 44
  },

  onLoad() {
    util.showLoading()
    this.getClassifiesAndGoods()
  },

  onShareAppMessage() {},

  /**
   * 获取商品数据
   */
  getClassifiesAndGoods() {
    var that = this
    goodsManager.getClassifiesAndGoods().then(res => {
      goodsList = res.result.goodsList
      const selected = that.data.classifySelect ? that.data.classifySelect : goodsList[0].id

      that.setData({
        classifySelect: selected,
        classifies: res.result.classifies,
        goodsList: [].concat(goodsList).splice(0, 2),
      })
      wx.hideLoading()
    })
  },

  /**
   * 添加购物车
   */
  addToShopCar(e) {
    shopCarUtil.addToShopCar(e.target.dataset.goodsid, util.showToast)
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

  /**
   * 搜索
   */
  onClickSearch() {
    util.navigateTo('goodsSearch/goodsSearch')
  },

  /**
   * 商品分类的点击事件
   */
  onClickClassify: function (e) {
    var that = this;
    that.setData({
      goodsList: goodsList,
      rigId: e.target.dataset.id
    })
  },

  /**
   * 滚动触发
   */
  scroll: function (e) {
    var that = this;
    var h = 0,
      classifySelect,
      scrollTop = e.detail.scrollTop

    that.data.classifies.forEach(clssfiy => {
      const _h = that.getItemHeight(clssfiy.id) * 95 + 34;
      if (scrollTop >= h) {
        classifySelect = clssfiy.id;
      }
      h += _h;
    })
    that.setData({
      goodsList: goodsList,
      classifySelect: classifySelect,
    })

    that.handleRefresh(scrollTop)
  },

  /**
   * 求每一栏高度
   */
  getItemHeight(id) {
    const that = this;
    const goodsList = that.data.goodsList
    for (var i = 0; i < goodsList.length; i++) {
      if (goodsList[i].id == id) {
        return goodsList[i].content.length;
      }
    }
  },

  handleRefresh(scrollTop) {
    if (scrollTop <= -60) {
      isFitRefresh = true
    }
    if (scrollTop == 0 && isFitRefresh) {
      util.showLoading()
      this.getClassifiesAndGoods()
      isFitRefresh = false
    }
  }
})