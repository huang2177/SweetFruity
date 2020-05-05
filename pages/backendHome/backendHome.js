// pages/bakendHome/backendHome.js
var goodsList = []
const util = require('../../utils/util.js')
const goodsManager = require('../../utils/goodsManager.js')

Page({

  onLoad: function () {
    var that = this
    that.getClassifiesAndGoods()
  },

  getClassifiesAndGoods() {
    var that = this
    goodsManager.getClassifiesAndGoods().then(res => {
      goodsList = res.result.goodsList

      that.setData({
        classifySelect: goodsList[0].id,
        classifies: res.result.classifies,
        goodsList: that.getGoodsListByClassify(goodsList[0].id),
      })
    })
  },

  /**
   * 商品分类的点击事件
   */
  onClickClassify: function (e) {
    var that = this;
    const id = e.target.dataset.id
    that.setData({
      classifySelect: id,
      goodsList: that.getGoodsListByClassify(id),
    })
  },

  getGoodsListByClassify(id) {
    const data = []
    goodsList.forEach(element => {
      if (element.id == id) data.push(element)
    });

    return data
  },

  editGoods(e) {
    const data = e.currentTarget.dataset
    const item = data.item
    item.classify = data.classify
    item.parentId = data.parentid
    wx.setStorageSync('goods', item)
    util.navigateTo('addGoods/addGoods')
  },

  navigate: function (e) {
    util.navigateTo(e.currentTarget.dataset.pageurl)
  },
})