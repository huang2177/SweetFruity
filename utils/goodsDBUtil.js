const db = wx.cloud.database()

function saveGoodsData(s, oldData, newdata) {
  var index = -1
  if (oldData && oldData.length > 0) {
    for (var i = 0; i < oldData.length; i++) {
      if (oldData[i]['id'] == newdata['id']) {
        index = i
        break
      }
    }
    if (index >= 0) {
      updateRecord(s, oldData[index], newdata)
    } else {
      addNewRecord(s, newdata)
    }
  } else {
    addNewRecord(s, newdata)
  }
}

function addNewRecord(s, data) {
  db.collection("goodsListData").add({
    data: data,
    success: s.uploadSuccess,
    fail: s.uploadFail
  });
}

function updateRecord(s, data, newdata) {
  const id = data.id
  const content = data.content
  content.push(newdata.content[0])
  db.collection("goodsListData")
    .doc(data._id)
    .update({
      data: {
        id: id,
        content: content
      },
      success: s.uploadSuccess,
      fail: s.uploadFail
    });
}

function updateGoodsStockNum(goodsId, sum, callBack) {
  var _id = -1
  var content = []
  db.collection("goodsListData").get().then(res => {
    res.data.forEach(function (goodsData, i) {
      goodsData.content.forEach(function (goods, j) {
        if (goodsId == goods['goodsId'] && goods['stockNum'] && goods['stockNum'] > 0) {
          _id = goodsData._id
          content = goodsData.content
          var newdata = goods
          newdata['stockNum'] = goods['stockNum'] - sum
          content[j] = newdata
        }
      })
    })

    if (_id) {
      db.collection("goodsListData")
        .doc(_id)
        .update({
          data: {
            content: content
          },
          success: callBack(),
        });
    }
  })
}

function updateGoodsData(s, newdata) {
  var _id = -1
  var content = []
  db.collection("goodsListData").get().then(res => {
    res.data.forEach(function (goodsData, i) {
      goodsData.content.forEach(function (goods, j) {
        if (newdata['goodsId'] == goods['goodsId']) {
          content = goodsData.content
          _id = goodsData._id
          content[j] = newdata
        }
      })
    })

    if (_id) {
      db.collection("goodsListData")
        .doc(_id)
        .update({
          data: {
            content: content
          },
          success: s.uploadSuccess,
          fail: s.uploadFail
        });
    }
  })
}

function deleteGoods(s, oldData, goodsId, parentId) {
  var index = -1
  oldData.forEach(function (data, i) {
    if (data['id'] == parentId) {
      index = i
    }
  })
  if (index >= 0) {
    const content = oldData[index].content
    if (content.length <= 1 && content[0]['goodsId'] == goodsId) {
      removeWholeContent(s, oldData[index]['_id'])
    } else {
      deleteAndUpdate(s, content, goodsId, oldData[index]['_id'], parentId)
    }
  }
}

function deleteAndUpdate(s, content, goodsId, parent_Id, parentId) {
  var index = -1
  content.forEach(function (data, i) {
    if (data['goodsId'] == goodsId) {
      index = i
    }
  })
  if (index >= 0) {
    content.splice(index, 1)
  }
  db.collection("goodsListData")
    .doc(parent_Id)
    .update({
      data: {
        id: parentId,
        content: content
      },
      success: s.deleteSuccess,
      fail: s.deleteFail
    });
}

function removeWholeContent(s, id) {
  db.collection("goodsListData")
    .doc(id)
    .remove({
      success: s.deleteSuccess,
      fail: s.deleteFail
    });
}

function generateClassifyId(data) {
  var parentId = 1001
  data.forEach(function (claasify, i) {
    if (claasify['id'] == parentId) {
      parentId++
    }
  })
  return parentId + ''
}

function generateGoodsId(data, parentId) {
  var goodsId = 1001
  data.forEach(function (goods, i) {
    if (goods['id'] == parentId) {
      const contents = goods['content']
      goodsId += contents.length
      contents.forEach(content => {
        if (content['goodsId'] == (parentId + '-' + goodsId)) {
          goodsId++
        }
      })
    }
  })
  return parentId + '-' + goodsId
}

module.exports = {
  deleteGoods: deleteGoods,
  saveGoodsData: saveGoodsData,
  updateGoodsData: updateGoodsData,
  updateGoodsStockNum: updateGoodsStockNum,
  generateGoodsId: generateGoodsId,
  generateClassifyId: generateClassifyId,
}