// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
const dbCollection = db.collection('orderInfo')

// 云函数入口函数
exports.main = async (event, context) => {
  const action = event.action
  const openId = event.openId

  switch (action) {
    case 'PUT':

      break;

    case 'GET':
      var query = dbCollection
      if (openId) {
        query = dbCollection.where({
          _openid: openId
        })
      }
      return await query
        .orderBy('isCompleted', 'asc')
        .orderBy('createTime', 'asc')
        .get()

    default:
      return {
        msg: 'action must not be null!'
      }
  }
}