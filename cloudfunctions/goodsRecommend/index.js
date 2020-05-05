// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
const _ = db.command
const recommendGoodsDB = db.collection('recommendGoods')

// 云函数入口函数
exports.main = async (event, context) => {
  const action = event.action
  switch (action) {
    case 'HOT_SEARCH':
      return getHotSeach()

    case 'RECOMMEND_GOODS':
      return getRecommendGoods()

    case 'RECOMMEND_BUY':
      return calculateRecommedWeight(event, 3)

    case 'RECOMMEND_SEARCH':
      return calculateRecommedWeight(event, 2)

    case 'RECOMMEND_SHOP_CAR':
      return calculateRecommedWeight(event, 1)

    default:
      break;
  }
}

/**
 * 获取热门搜索
 */
async function getHotSeach() {
  const res = await recommendGoodsDB.where({
      text: _.neq(null).and(_.neq(''))
    })
    .orderBy('weight', 'desc')
    .limit(12)
    .get()

  return arrayUnique(res.data)
}

function arrayUnique(arr) {
  var result = [];
  arr.forEach(data => {
    if (result.indexOf(data.text) < 0) {
      result.push(data.text)
    }
  })
  return result;
}

/**
 * 获取推荐商品
 */
async function getRecommendGoods() {
  const data = []
  var recommends = await recommendGoodsDB.where({
      _openid: cloud.getWXContext().OPENID
    })
    .orderBy('weight', 'desc')
    .limit(5)
    .get()

  if (recommends.data.length == 0) {
    recommends = await recommendGoodsDB.orderBy('weight', 'desc')
      .limit(5)
      .get()
  }

  const goodsList = await cloud.callFunction({
    name: 'goodsManager',
    data: {
      action: 'ALL_GOODS'
    }
  })

  goodsList.result.forEach(goods => {
    recommends.data.forEach(recommend => {
      if (goods.goodsId == recommend.goodsId) {
        data.push(goods)
      }
    })
  })

  return data
}

/**
 * 计算推荐系数并存储 
 */
async function calculateRecommedWeight(event, weight) {
  var id = ''
  var newWeight = -1
  const res = await recommendGoodsDB.where({
      _openid: cloud.getWXContext().OPENID
    })
    .get()

  for (var i = 0; i < res.data.length; i++) {
    if (res.data[i].goodsId == event.goodsId) {
      id = res.data[i]._id
      newWeight = res.data[i].weight + weight
      break
    }
  }

  if (newWeight != -1) {
    return await recommendGoodsDB.doc(id).update({
      data: {
        weight: newWeight,
      }
    })
  } else {
    const data = {
      weight: weight,
      goodsId: event.goodsId,
      _openid: cloud.getWXContext().OPENID
    }
    if (event.text) {
      data.text = event.text
    }
    return await recommendGoodsDB.add({
      data: data
    })
  }
}