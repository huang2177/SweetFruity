// pages/bakendHome/backendHome.js
var goodsList = []
var groupData = []
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
      const groupClassify = [{
        id: '0x10',
        text: '团购活动'
      }]

      that.setData({
        classifySelect: goodsList[0].id,
        goodsList: that.getGoodsListByClassify(goodsList[0].id),
        classifies: res.result.classifies.concat(groupClassify),
      })
    })

    goodsManager.getGroupData().then(res => {
      groupData = res.result.data
    })
  },

  /**
   * 商品分类的点击事件
   */
  onClickClassify: function (e) {
    var that = this;
    const id = e.target.dataset.id
    const isGroup = id == '0x10'
    that.setData({
      classifySelect: id,
      goodsList: that.getGoodsListByClassify(id),
    })
  },

  getGoodsListByClassify(id) {
    const data = []
    if (id == '0x10') {
      const goodsList = {}
      goodsList.content = groupData
      data.push(goodsList)
      return data
    }
    goodsList.forEach(element => {
      if (element.id == id) data.push(element)
    });

    return data
  },

  editGoods(e) {
    const data = e.currentTarget.dataset
    const item = data.item

    if (data.classify) {
      item.classify = data.classify
      item.parentId = data.parentid
      wx.setStorageSync('goods', item)
      util.navigateTo('addGoods/addGoods')
    } else {
      wx.setStorageSync('group', item)
      util.navigateTo('addGroup/addGroup')
    }
  },

  navigate: function (e) {
    util.navigateTo(e.currentTarget.dataset.pageurl)
  },
})