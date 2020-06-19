// pages/addGroup/addGroup.js
var groupData
const db = wx.cloud.database()
const util = require('../../utils/util.js')
const msgUtil = require('../../utils/messageUtil.js')
const orderUtil = require('../../utils/orderUtil.js')
const goodsDbUtil = require('../../utils/goodsDBUtil.js')

Page({

  data: {
    multiArray: [
      [util.getDateStr(0), util.getDateStr(1), util.getDateStr(2)], util.getCustomTimes(),
    ],
  },

  onLoad: function (options) {
    var that = this
    db.collection("groupData").get().then(res => {
      groupData = res.data
      that.fillDefaultText()
    })
  },

  fillDefaultText: function () {
    var that = this
    const group = wx.getStorageSync('group')

    that.setData({
      group: group,
      text: group ? group.text : '',
      imagePath: group ? group.url : '',
      member: group ? group.member : 0,
      price: group ? group.unitPrice : 0,
      oldPrice: group ? group.oldPrice : 0,
      hasMember: group ? group.hasMember : 0,
      closeTime: group ? group.closeTime : '未选择！',
      id: group ? group.id : goodsDbUtil.generateGroupId(groupData),
    })
    wx.setStorageSync('group', null)
  },

  onUnload: function () {
    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];
    prevPage.onLoad()
  },

  save: function () {
    var that = this
    const filePath = that.data.imagePath

    if (!filePath || !that.data.text ||
      !that.data.price || !that.data.oldPrice ||
      !that.data.member) {
      util.showModal('请填写完整的商品数据！')
      return
    }

    if (that.data.group && filePath == that.data.group.url) {
      that.upload(filePath)
    } else {
      var timestamp = Date.parse(new Date());
      const cloudPath = timestamp + filePath.match(/\.[^.]+?$/)[0]
      wx.cloud.uploadFile({
        cloudPath,
        filePath,
        success: res => that.upload(res.fileID),
      })
    }
  },

  upload(fileID) {
    var that = this
    const data = {
      url: fileID,
      id: that.data.id,
      text: that.data.text,
      member: that.data.member,
      unitPrice: that.data.price,
      oldPrice: that.data.oldPrice,
      hasMember: that.data.hasMember,
      closeTime: that.data.closeTime,
    }

    if (that.data.group) {
      goodsDbUtil.updateGroupData(that, data)
    } else {
      goodsDbUtil.saveGroupData(that, data)
    }
  },

  uploadSuccess: function (res) {
    util.showModal('操作成功!', false, () => {
      wx.navigateBack({
        delta: 1,
      })
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

  close: function () {
    var that = this
    util.showModal('确定结束该拼团活动？', true, () => {
      orderUtil.getGroupOrders().then(res => {
        const id = that.data.group._id
        msgUtil.sendGroupedSuccessMsg(id, res.data)

        goodsDbUtil.deleteGroup(id).then(res => {
          that.deleteSuccess()
        }).catch(that.deleteFail)
      })
    })
  },

  deleteSuccess: function (res) {
    this.fillDefaultText()
    wx.showToast({
      icon: 'success',
      title: '结束成功！',
      duration: 3000
    })
  },

  deleteFail() {
    wx.showToast({
      image: '../../pages/image/error.png',
      title: '结束失败！',
      duration: 3000
    })
  },

  bindMultiPickerChange(e) {
    var that = this
    const index = e.detail.value
    const day = that.data.multiArray[0][index[0]]
    const time = that.data.multiArray[1][index[1]]

    that.setData({
      closeTime: day + ' ' + time,
    })
  },

  onInputDesc: function (options) {
    this.setData({
      text: options.detail.value
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
  onInputMember(e) {
    this.setData({
      member: e.detail.value
    })
  },
  onInputHasMember(e) {
    this.setData({
      hasMember: e.detail.value
    })
  }

})