const db = wx.cloud.database()

function getGroupOrders() {
  return db.collection("orderInfo").where({
      isGroup: true
    })
    .get();
}

module.exports = {
  getGroupOrders: getGroupOrders,
}