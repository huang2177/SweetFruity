// pages/bakendHome/backendHome.js
const goodsDbUtil = require('../../utils/goodsDBUtil.js')
const db = wx.cloud.database()

Page({
  data: {
    goodsListData: []
  },

  onLoad: function (options) {
    var that = this
    db.collection("goodsListData").get({
      success: function (res) {
        that.setData({
          goodsListData: res.data
        })
      }
    })
  },

  deleteGoods: function (e) {
    const data = e.currentTarget.dataset
    const item = data.item
    item.classify = data.classify
    item.parentId  = data.parentid
    wx.setStorageSync('goods', item)
    wx.navigateTo({
      url: '../addGoods/addGoods',
    })
  },

  navigate: function (e) {
    const pageUrl = e.currentTarget.dataset.pageurl
    wx.navigateTo({
      url: pageUrl
    })
  },

})