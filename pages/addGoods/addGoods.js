// miniprogram/pages/addGoods/addGoods.js
const db = wx.cloud.database()
const util = require('../../utils/util.js')
const goodsDbUtil = require('../../utils/goodsDBUtil.js')

Page({
  data: {
    id: 0,
    price: 0,
    goodsId: 0,
    oldPrice: 0,
    imagePath: '',
    goodsName: '',
    showModal: false,
    selectedClassify: '未选择',
    goodsClassifies: [],
    goodsListData: []
  },

  onLoad: function (options) {
    var that = this
    that.fillDefaultText()
    that.getData()
  },

  getData: function (fun) {
    var that = this
    db.collection("goodsClassifies").get({
      success: function (res) {
        if (fun) fun(res.data)
        that.setData({
          goodsClassifies: res.data
        })
      }
    })
    db.collection("goodsListData").get({
      success: function (res) {
        that.setData({
          goodsListData: res.data
        })
      }
    })
  },

  fillDefaultText: function () {
    var that = this
    const goods = wx.getStorageSync('goods')

    that.setData({
      goods: goods,
      id: goods ? goods.parentId : '',
      imagePath: goods ? goods.url : '',
      goodsName: goods ? goods.text : '',
      goodsId: goods ? goods.goodsId : '',
      selectedClassify: goods ? goods.classify : '未选择！',
      price: goods ? goods.unitPrice : 0,
      oldPrice: goods ? goods.oldPrice : 0,
      stockNum: goods ? goods.stockNum : 0,
    })
    wx.setStorageSync('goods', null)
  },

  onUnload: function () {
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];
    prevPage.onLoad()
  },

  save: function () {
    var that = this
    const filePath = that.data.imagePath

    if (!filePath || !that.data.stockNum ||
      !that.data.goodsName || !that.data.price ||
      !that.data.oldPrice || that.data.selectedClassify == '未选择') {
      wx.showModal({
        title: '提示',
        content: '请填写完整的商品数据！',
      })
      return
    }

    if (that.data.goods && filePath == that.data.goods.url) {
      that.upload(filePath)
    } else {
      var timestamp = Date.parse(new Date());
      const cloudPath = timestamp + filePath.match(/\.[^.]+?$/)[0]
      wx.cloud.uploadFile({
        cloudPath,
        filePath,
        success: res => that.upload(res.fileID)
      })
    }
  },
  upload(fileID) {
    var that = this
    const goodsId = that.data.goods ?
      that.data.goods.goodsId :
      goodsDbUtil.generateGoodsId(that.data.goodsListData, that.data.id)
    const data = {
      id: that.data.id,
      text: that.data.selectedClassify,
      content: [{
        sum: 0,
        url: fileID,
        goodsId: goodsId,
        text: that.data.goodsName,
        unitPrice: that.data.price,
        oldPrice: that.data.oldPrice,
        stockNum: Number(that.data.stockNum),
      }]
    }

    if (that.data.goods) {
      goodsDbUtil.updateGoodsData(that, data.content[0])
    } else {
      goodsDbUtil.saveGoodsData(that, that.data.goodsListData, data)
    }
  },

  uploadSuccess: function (res) {
    var that = this
    wx.showModal({
      title: '添加成功',
      content: '是否继续添加？',
      success: function (res) {
        if (res.cancel) {
          wx.navigateBack({
            delta: 1,
          })
        } else {
          that.onLoad()
        }
      }
    })
  },

  uploadFail: function (res) {
    wx.showToast({
      image: '../image/error.png',
      title: '操作失败',
      duration: 3000
    })
  },

  // 选择图片
  chooseImage: function () {
    var that = this
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        that.setData({
          imagePath: res.tempFilePaths[0],
        })
      },
    })
  },

  //预览图片
  preView: function () {
    wx.previewImage({
      current: this.data.imagePath,
      urls: [this.data.imagePath]
    })
  },

  showModal: function () {
    this.getData(classifies => {
      if (!classifies || classifies.length == 0) {
        wx.showModal({
          title: '提示',
          content: '还未添加商品分类，是否添加？',
          success: function (res) {
            if (!res.cancel) {
              wx.navigateTo({
                url: '../goodsClassify/goodsClassify'
              })
            }
          }
        })
        return
      }
      this.setData({
        showModal: true,
      })
    })
  },

  hideModal: function (e) {
    var item = e.target.dataset.item
    this.setData({
      id: item.id,
      showModal: false,
      selectedClassify: item.text,
    })
  },

  delete: function () {
    var that = this
    wx.showModal({
      title: '提示',
      content: '确定删除该商品信息？',
      showCancel: true,
      success: function (res) {
        if (!res.cancel) {
          goodsDbUtil.deleteGoods(that, that.data.goodsListData, that.data.goods.goodsId, that.data.goods.parentId)
        }
      },
    })
  },

  deleteSuccess: function (res) {
    this.fillDefaultText()
    wx.showToast({
      icon: 'success',
      title: '删除成功',
      duration: 3000
    })
  },

  deleteFail: function (res) {
    wx.showToast({
      image: '../image/error.png',
      title: '删除失败',
      duration: 3000
    })
  },

  onInputGoodsName: function (options) {
    this.setData({
      goodsName: options.detail.value
    })
  },

  onInputOldPrice: function (options) {
    this.setData({
      oldPrice: options.detail.value
    })
  },
  onInputPrice: function (options) {
    this.setData({
      price: options.detail.value
    })
  },
  onInputStockNum: function (options) {
    this.setData({
      stockNum: options.detail.value
    })
  },
})