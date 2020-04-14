// pages/goodsClassify/goodsClassify.js
const goodsDbUtil = require('../../utils/goodsDBUtil.js')
const db = wx.cloud.database()

Page({
  data: {
    clssify: '',
    goodsClassifies: []
  },

  onLoad: function (options) {
    var that = this
    db.collection("goodsClassifies").get({
      success: function (res) {
        that.setData({
          goodsClassifies: res.data
        })
      }
    })
  },

  addClaasify: function () {
    if (!this.data.clssify) return
    const text = this.data.clssify
    const id = goodsDbUtil.generateClassifyId(this.data.goodsClassifies)
    this.saveGoodsClassifies(id, text)
  },

  deleteClassify: function (e) {
    var that = this
    wx.showModal({
      title: '提示',
      content: '确定删除？',
      success: function (res) {
        if (!res.cancel) {
          const item = e.target.dataset.item
          that.removeRecord(item._id)
        }
      }
    })
  },

  //上传数据
  saveGoodsClassifies: function (id, text) {
    var that = this
    that.addNewRecord(id, text)
  },

  addNewRecord: function (id, text) {
    var that = this
    db.collection("goodsClassifies").add({
      data: {
        id: id,
        text: text
      },
      success: function (res) {
        that.uploadSuccess(res)
      },
      fail: function (res) {
        that.uploadFail(res)
      }
    });
  },

  removeRecord: function (_id) {
    var that = this
    db.collection("goodsClassifies").doc(_id).remove({
      success: function (res) {
        that.uploadSuccess(res)
      },
      fail: function (res) {
        that.uploadFail(res)
      }
    })
  },

  uploadSuccess: function (res) {
    this.onLoad()
    wx.showToast({
      title: '操作成功',
      duration: 3000
    })
  },

  uploadFail: function (res) {
    console.log(res)
    wx.showToast({
      image: '../image/error.png',
      title: '操作失败',
      duration: 3000
    })
  },

  onInputContent: function (options) {
    this.setData({
      clssify: options.detail.value,
    })
  },

})