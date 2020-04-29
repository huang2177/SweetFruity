function getUserInfo(e, callBack) {
  if (e.detail.userInfo) {
    var nickName = e.detail.userInfo.nickName
    var avatarUrl = e.detail.userInfo.avatarUrl
    wx.setStorageSync('nickName', nickName)
    wx.setStorageSync('avatarUrl', avatarUrl)
    callBack(nickName, avatarUrl)
  }
}

function getPhoneNumber(e, callBack) {
  if (e.detail.encryptedData) {
    wx.cloud.callFunction({
      name: 'login',
      data: {
        action: 'phoneNumber',
        baseData: wx.cloud.CloudID(e.detail.cloudID)
      }
    }).then(res => {
      var openId = res.result.openId
      var phoneNumber = res.result.event.baseData.data.phoneNumber
      wx.setStorageSync('openId', openId)
      wx.setStorageSync('phoneNumber', phoneNumber)
      callBack(phoneNumber)
    })
  }
}

function getOpenId(callBack) {
  wx.cloud.callFunction({
    name: 'login',
    data: {
      action: 'openId',
    }
  }).then(res => {
    console.log(res)
    var openId = res.result.openId
    wx.setStorageSync('openId', openId)

    if (callBack) callBack(openId)
  })
}

module.exports = {
  getOpenId: getOpenId,
  getUserInfo: getUserInfo,
  getPhoneNumber: getPhoneNumber
}