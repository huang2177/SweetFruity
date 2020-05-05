function getAllGoods() {
  return wx.cloud.callFunction({
    name: 'goodsManager',
    data: {
      action: 'ALL_GOODS'
    }
  })
}

function searchGoods(value) {
  if (value) {
    return wx.cloud.callFunction({
      name: 'goodsManager',
      data: {
        value: value,
        action: 'SEARCH_GOODS'
      }
    })
  }
}

function getClassifiesAndGoods() {
  return wx.cloud.callFunction({
    name: 'goodsManager',
    data: {
      action: 'GET_CLSSIFY_AND_GOODS'
    }
  })
}


module.exports = {
  getAllGoods: getAllGoods,
  searchGoods: searchGoods,
  getClassifiesAndGoods: getClassifiesAndGoods
}