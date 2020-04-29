const app = getApp()

// 添加到购物车
function addToShopCar(data, goodsId, fun) {
  var item = {}
  data.forEach(function (goodsData, i) {
    if (goodsId.indexOf(goodsData['id']) >= 0) {
      goodsData.content.forEach(function (goods, i) {
        if (goodsId == goods['goodsId']) {
          item = goods
        }
      })
    }
  })
  add(item, fun)
}

function add(goods, fun) {
  if (goods.stockNum <= 0) {
    return
  }
  if (!goods.stockNum) {
    goods.stockNum = 100
  }
  var index = -1;
  var cartsStorage = wx.getStorageSync('carts')
  var carts = cartsStorage ? cartsStorage : [];

  for (var i = 0; i < carts.length; i++) {
    index = carts[i]['goodsId'] == goods.goodsId ? i : index
  }
  if (index == -1) {
    goods.sum = 1
    carts.push(goods)
  } else if ((index >= 0 && !overStock(carts[index]))) {
    carts[index].sum++;
  }

  getApp().getCartsSum(carts)
  wx.setStorageSync('carts', carts)
  if (fun) {
    fun(carts)
  }
}

//判断是否超出库存
function overStock(item) {
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
}

// 移除购物车
function removeFromShopCar(goodsId, fun) {
  var index = -1;
  var carts = wx.getStorageSync('carts');
  for (var i = 0; i < carts.length; i++) {
    index = carts[i]['goodsId'] == goodsId ? i : index
  }

  if (index >= 0 && carts[index].sum) {
    carts[index].sum--;
    if (!carts[index].sum) {
      carts.splice(index, 1)
    }
    if (fun) fun(carts)

    getApp().getCartsSum(carts)
    wx.setStorageSync('carts', carts)
  }
}

// 清空购物车
function clearShopCar(fun) {
  wx.setStorageSync('carts', [])
  getApp().getCartsSum([])
  if (fun) fun([])
}

// 计算购物车数量
function getCartsSum(carts) {
  var cartsSum = 0
  for (var i = 0; i < carts.length; i++) {
    cartsSum += (carts[i].sum) ? carts[i].sum : 0
  }
  return cartsSum
}

function getTotalSum(carts) {
  var data = {
    totalSum: 0,
    totalMoney: 0,
  }
  if (!carts) return data

  for (var i = 0; i < carts.length; i++) {
    if (carts[i].sum) {
      data.totalSum += carts[i].sum
      data.totalMoney += carts[i].sum * carts[i].unitPrice
    }
  }
  return data
}

/**
 * 判断商品是否下架
 * @param {*} data 
 * @param {*} fun 
 */
function hasStock(data, success, error) {
  var hasStock
  var goodsName
  const goodsIds = []
  const carts = wx.getStorageSync('carts')
  data.forEach(function (goodsData, i) {
    goodsData.content.forEach(function (goods, i) {
      goodsIds.push(goods['goodsId'])
    })
  })
  for (let i = 0; i < carts.length; i++) {
    const cart = carts[i];
    if (goodsIds.indexOf(cart['goodsId']) >= 0) {
      hasStock = true
    } else {
      hasStock = false
      goodsName = cart['text']
      break
    }
  }
  if (hasStock) {
    success()
  } else {
    error(goodsName)
  }
}

module.exports = {
  hasStock: hasStock,
  getTotalSum: getTotalSum,
  getCartsSum: getCartsSum,
  clearShopCar: clearShopCar,
  addToShopCar: addToShopCar,
  removeFromShopCar: removeFromShopCar,
}