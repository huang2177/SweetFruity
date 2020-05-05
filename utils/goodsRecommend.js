function updateRecommend(goodsId, action, text) {
  return wx.cloud.callFunction({
    name: 'goodsRecommend',
    data: {
      text: text,
      action: action,
      goodsId: goodsId,
    }
  })
}

function getRecommendData(action) {
  return wx.cloud.callFunction({
    name: 'goodsRecommend',
    data: {
      action: action
    }
  })
}

module.exports = {
  updateRecommend: updateRecommend,
  getRecommendData: getRecommendData
}