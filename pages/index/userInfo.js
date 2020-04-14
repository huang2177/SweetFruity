function getUserInfo(that, e) {
  if (e.detail.userInfo) {
    var nickName = e.detail.userInfo.nickName
    var avatarUrl = e.detail.userInfo.avatarUrl
    wx.setStorageSync('nickName', nickName)
    wx.setStorageSync('avatarUrl', avatarUrl)
    that.setData({
      hasNickName: true,
    })
  }
}

function getPhoneNumber(that, e, callBack) {
  if (e.detail.encryptedData) {
    wx.cloud.callFunction({
      name: 'login',
      data: {
        baseData: wx.cloud.CloudID(e.detail.cloudID)
      }
    }).then(res => {
      var phoneNumber = res.result.event.baseData.data.phoneNumber
      wx.setStorageSync('phoneNumber', phoneNumber)
      that.setData({
        hasPhoneNumber: true,
      })
      callBack()
    })
  }
}

module.exports = {
  getUserInfo: getUserInfo,
  getPhoneNumber: getPhoneNumber
}