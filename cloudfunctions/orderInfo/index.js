// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
const dbCollection = db.collection('orderInfo')

// 云函数入口函数
exports.main = async (event, context) => {
  const action = event.action
  switch (action) {
    case 'GET_ALL':
      return await dbCollection
        .orderBy('isCompleted', 'asc')
        .orderBy('createTime', 'asc')
        .get()

    case 'GET_USER':
      return await dbCollection
        .where({
          _openid: cloud.getWXContext().OPENID
        })
        .orderBy('isCompleted', 'asc')
        .orderBy('createTime', 'asc')
        .get()

    default:
      return {
        msg: 'action must not be null!'
      }
  }
}