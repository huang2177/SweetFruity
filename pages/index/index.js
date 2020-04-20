//index.js
const db = wx.cloud.database()
const shopCarUtil = require('../../utils/shopCarUtil.js')

Page({
  data: {
    rigId: 0,
    classifySelect: '',
    goodsListData: [],
    goodsClassifies: [],
  },

  onLoad: function (options) {
    wx.showLoading({
      title: '加载中…'
    })
  },

  onShow: function () {
    this.getGoodsClassifies()
  },

  /**
   * 获取商品分类数据
   */
  getGoodsClassifies: function (fun) {
    var that = this
    db.collection("goodsClassifies").get({
      success: function (res) {
        that.getGoodsListData(res.data, fun)
      }
    })
  },

  /**
   * 获取商品列表数据
   * @param {商品分类} classifies 
   */
  getGoodsListData: function (classifies, fun) {
    var that = this
    db.collection("goodsListData").get({
      success: function (res) {
        if (fun) fun(res.data)

        wx.hideLoading()
        that.setGoodsListData(classifies, res.data)
      },
    })
  },

  /**
   * 设置商品列表数据
   * @param {商品列表数据} data 
   */
  setGoodsListData(classifies, data) {
    var that = this
    var goodsListData = []
    classifies.forEach(classify => {
      data.forEach(goods => {
        if (classify['id'] == goods['id']) {
          goodsListData.push(goods)
        }
      })
    })
    that.setData({
      goodsClassifies: classifies,
      goodsListData: goodsListData,
      showEmptyImage: goodsListData == 0,
      classifySelect: that.data.classifySelect ?
        classifySelect : goodsListData && goodsListData[0] ? goodsListData[0]['id'] : classifySelect,
    })
  },

  /**
   * 添加购物车
   * @param {*} e 
   */
  addToShopCar(e) {
    var that = this
    that.getGoodsClassifies(data => {
      shopCarUtil.addToShopCar(data, e.target.dataset.goodsid)
    })
  },

  /**
   * 商品分类的点击事件
   * @param {*} e 
   */
  onClickClassify: function (e) {
    var that = this;
    var l_id = e.currentTarget.dataset.id;
    console.log(l_id)
    that.setData({
      rigId: l_id,
      classifySelect: l_id,
      isClickLeftText: true
    })
  },

  /**
   * 预览图片
   * @param {*} e 
   */
  previewImage: function (e) {
    const url = e.target.dataset.url
    wx.previewImage({
      current: url,
      urls: [url]
    })
  },

  /**
   * 滚动触发
   * @param {*} e 
   */
  scroll: function (e) {
    var that = this;
    var scrollTop = e.detail.scrollTop,
      h = 0,
      classifySelect;
    that.data.goodsClassifies.forEach(function (clssfiy, i) {
      var _h = 26 + that.getItemHeight(clssfiy['id']) * 100;
      if (scrollTop >= h) {
        classifySelect = clssfiy['id'];
      }
      h += _h;
    })
    if (!that.data.isClickLeftText) {
      that.setData({
        classifySelect: classifySelect,
      })
    }
    that.setData({
      isClickLeftText: false
    })
  },

  /**
   * 求每一栏高度
   * @param {商品分类Id} id 
   */
  getItemHeight: function (id) {
    var that = this;
    var rightData = that.data.goodsListData;
    for (var i = 0; i < rightData.length; i++) {
      if (rightData[i]['id'] == id) {
        return rightData[i]['content'].length;
      }
    }
  },
})