//index.js
//获取应用实例
var modalJs = require("modal.js")
var userInfo = require("userInfo.js")
const db = wx.cloud.database()

Page({
  data: {
    rigId: 0,
    hideModal: true,
    animationData: {},
    classifySelect: '',
    hasNickName: false,
    hasPhoneNumber: false,
    cartsSum: 0,
    carts: [],
    goodsClassifies: [],
    goodsListData: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中…'
    })
    var that = this
    var carts = wx.getStorageSync('carts')
    var nickName = wx.getStorageSync('nickName')
    var phoneNumber = wx.getStorageSync('phoneNumber')

    this.setData({
      carts: carts ? carts : [],
      hasNickName: nickName ? true : false,
      hasPhoneNumber: phoneNumber ? true : false,
    })

    this.setData({
      cartsSum: that.getCartsSum(),
    })

    wx.onAppHide(function () {
      that.clearShopCarAndStorage()
    })

    that.updateBackendInfo()
  },

  onShow: function () {
    this.getGoodsClassifies()
    const paySuccess = wx.getStorageSync('paySuccess')
    if (paySuccess) {
      this.clearShopCarAndStorage()
      wx.setStorageSync('paySuccess', false)
    }
  },

  //获取数据
  getGoodsClassifies: function (fun) {
    var that = this
    db.collection("goodsClassifies").get({
      success: function (res) {
        that.getGoodsListData(res.data, fun)
        that.setData({
          goodsClassifies: res.data
        })
      }
    })
  },

  //获取数据
  getGoodsListData: function (classifies, fun) {
    var that = this
    db.collection("goodsListData").get({
      success: function (res) {
        if (fun) fun(res.data)
        var goodsListData = []
        classifies.forEach(classify => {
          res.data.forEach(goods => {
            if (classify['id'] == goods['id']) {
              goodsListData.push(goods)
            }
          })
        })
        that.setData({
          goodsListData: goodsListData,
          showEmptyImage: goodsListData == 0,
          classifySelect: that.data.classifySelect ?
            classifySelect : goodsListData && goodsListData[0] ? goodsListData[0]['id'] : classifySelect,
        })
        wx.hideLoading()
      },
      fail: function (rs) {
        wx.hideLoading()
        that.setData({
          showEmptyImage: true,
        })
      }
    })
  },

  updateBackendInfo: function () {
    var that = this
    db.collection('backendManager').get({
      success: function (res) {
        if (res.data.length == 0) {
          return
        }
        const phoneNumber = wx.getStorageSync('phoneNumber')
        const managerPhones = res.data[0].managerPhones
        managerPhones.forEach(function (phone, i) {
          if (phone == phoneNumber) {
            that.setData({
              showDeployMenu: true,
            })
            return
          }
        })
      }
    })
  },

  // 添加到购物车
  addToShopCar: function (e) {
    var that = this
    const item = e.target.dataset.item
    that.getItemGoods(item.goodsId).then(goods => {
      that.addShopCar(goods)
    }).catch(err => {
      that.addShopCar(item)
    })
  },

  addShopCar(goods) {
    if (goods.stockNum <= 0) {
      return
    }
    if (!goods.stockNum) {
      goods.stockNum = 100
    }
    var that = this
    var index = -1;
    var carts = that.data.carts;

    for (var i = 0; i < carts.length; i++) {
      index = carts[i]['goodsId'] == goods.goodsId ? i : index
    }
    if (index == -1) {
      goods.sum = 1
      carts.push(goods)
    } else if ((index >= 0 && !that.overStock(carts[index]))) {
      carts[index].sum++;
    }
    that.setData({
      carts: carts,
      cartsSum: that.getCartsSum(),
    })
  },

  //判断是否超出库存
  overStock: function (item) {
    var that = this
    var isOverStock = false

    if (item.sum + 1 > item.stockNum) {
      isOverStock = true
      wx.showModal({
        title: '提示',
        content: '当前商品库存仅剩：' + item.stockNum + '件，请选择其他商品！',
        showCancel: false,
      })
    }
    return isOverStock
  },

  //重新获取最新的数据
  getItemGoods: function (goodsId) {
    var that = this
    var item = {}
    return new Promise((resolve, reject) => {
      that.getGoodsClassifies(function (data) {
        data.forEach(function (goodsData, i) {
          if (goodsId.indexOf(goodsData['id']) >= 0) {
            goodsData.content.forEach(function (goods, i) {
              if (goodsId == goods['goodsId']) {
                item = goods
                resolve(goods)
              }
            })
          }
        })
      })
      if (item == {}) reject(item)
    })
  },

  // 移除购物车
  removeFromShopCar: function (e) {
    var index = -1;
    var item = e.target.dataset.item;
    var carts = this.data.carts;
    for (var i = 0; i < carts.length; i++) {
      index = carts[i]['id'] == item.id ? i : index
    }

    if (index >= 0 && carts[index].sum) {
      carts[index].sum--;
      if (!carts[index].sum) {
        carts.splice(index, 1)
      }
    }
    this.setData({
      carts: carts,
      cartsSum: this.getCartsSum(),
    })
  },

  // 清空购物车
  clearShopCar: function () {
    var that = this
    if (!that.data.cartsSum) {
      wx.showModal({
        title: '提示',
        content: '购物车暂无商品！',
        showCancel: false,
      })
      return
    }
    wx.showModal({
      title: '提示',
      content: '是否清空所选中的商品?',
      showCancel: true,
      success: function (res) {
        if (!res.cancel) {
          that.clearShopCarAndStorage()
        }
      },
    })
  },

  clearShopCarAndStorage: function () {
    this.setData({
      carts: [],
      cartsSum: 0,
    })
    wx.setStorageSync('carts', [])
  },

  // 计算购物车数量
  getCartsSum: function () {
    var cartsSum = 0
    for (var i = 0; i < this.data.carts.length; i++) {
      cartsSum += (this.data.carts[i].sum) ? this.data.carts[i].sum : 0
    }
    return cartsSum
  },

  //跳转订单详情
  jumpToOrderPage: function () {
    wx.setStorageSync('carts', this.data.carts)
    wx.navigateTo({
      url: '../orderDetail/order'
    })
    this.hideModal()
  },

  //滚动触发
  scroll: function (e) {
    var scrollTop = e.detail.scrollTop,
      h = 0,
      classifySelect;
    var that = this;
    that.data.goodsClassifies.forEach(function (clssfiy, i) {
      var _h = 26 + that.length(clssfiy['id']) * 100;
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

  //求每一栏高度
  length: function (id) {
    var that = this;
    var rightData = that.data.goodsListData;
    for (var i = 0; i < rightData.length; i++) {
      if (rightData[i]['id'] == id) {
        return rightData[i]['content'].length;
      }
    }
  },

  //点击左边事件
  left_list: function (e) {
    var that = this;
    var l_id = e.currentTarget.dataset.id;
    that.setData({
      rigId: l_id,
      classifySelect: l_id,
      isClickLeftText: true
    })
  },

  //预览图片
  previewImage: function (e) {
    const url = e.target.dataset.url
    wx.previewImage({
      current: url,
      urls: [url]
    })
  },

  // 商品配置页面
  addGoods: function () {
    wx.navigateTo({
      url: '../backendHome/backendHome'
    })
    this.hideMenu()
  },
  loopOrder: function () {
    wx.navigateTo({
      url: '../loopOrder/loopOrder'
    })
    this.hideMenu()
  },
  showMenu: function () {
    this.setData({
      canShowDeployMenus: true
    })
  },

  hideMenu: function () {
    this.setData({
      canShowDeployMenus: false
    })
  },

  showModal: function () {
    modalJs.showModal(this)
  },

  hideModal: function () {
    modalJs.hideModal(this)
  },

  getUserInfo: function (e) {
    userInfo.getUserInfo(this, e)
  },

  getPhoneNumber: function (e) {
    userInfo.getPhoneNumber(this, e, this.jumpToOrderPage)
  },
})