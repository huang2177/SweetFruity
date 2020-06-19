// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({env:'release-ca90l'})
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const action = event.action
  switch (action) {
    case 'ALL_GOODS':
      return getAllGoods()
    case 'SEARCH_GOODS':
      return searchGoods(event)
    case 'GET_CLSSIFY_AND_GOODS':
      return getClassifiesAndGoods()
    case 'GROUPS':
      return getGroupData()
    default:
      break;
  }
}

/**
 * 返回所有的商品
 */
async function getAllGoods() {
  const data = []
  const res = await db.collection('goodsListData').get()
  res.data.forEach(list => {
    list.content.forEach(goods => {
      if (goods.stockNum != 0) {
        goods.id = list.id
        goods.category = goods.category ? goods.category : ''
        goods.stockNum = !goods.stockNum ? 100 : goods.stockNum
        data.push(goods)
      }
    })
  })

  return data
}

/**
 * 搜索商品
 */
async function searchGoods(event) {
  const searchData = []
  const value = event.value
  const goodsList = await getAllGoods()
  goodsList.forEach(goods => {
    if ((goods.text.indexOf(value) >= 0 || goods.category.indexOf(value) >= 0)) {
      searchData.push(goods)
    }
  })
  return searchData
}

async function getClassifiesAndGoods() {
  const goodsList = []
  const _classifies = await db.collection("goodsClassifies").get()
  const goodsListData = await db.collection("goodsListData").get()
  const classifies = _classifies.data

  classifies.forEach(classify => {
    goodsListData.data.forEach(goods => {
      if (classify.id == goods.id) goodsList.push(goods)
    })
  })
  return {
    goodsList,
    classifies
  }
}

async function getGroupData() {
  return await db.collection("groupData").get()
}