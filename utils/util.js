function randomInt(length) {
  return parseInt(Math.random() * length);
}

function randomBgImage() {
  return [
    '../image/bg1.jpeg', '../image/bg2.jpeg', '../image/bg3.jpeg', '../image/bg4.jpeg',
  ][randomInt(4)]
}

function randomWord() {
  var nums = "";
  var chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', ];

  for (var i = 0; i < 32; i++) {
    var id = parseInt(Math.random() * 35);
    nums += chars[id];
  }
  return nums;
}

function getDateStr(addDayCount) {
  var date = new Date();
  date.setDate(date.getDate() + addDayCount); //获取AddDayCount天后的日期 
  var m = date.getMonth() + 1; //获取当前月份的日期 
  var d = date.getDate();
  if (m < 10) {
    m = '0' + m;
  };
  if (d < 10) {
    d = '0' + d;
  };
  return m + "-" + d;
}

/**
 * 生成配送时间list
 */
function getCustomTimes() {
  const times = []
  for (var i = 10; i < 22; i++) {
    times.push(i + ' : 00')
    times.push(i + ' : 30')
  }
  times.push(22 + ' : 00')
  return times
}

function inDeliveryTime(day, time) {
  if (day == '明天') {
    return true
  }
  const currHours = new Date().getHours()
  const currMinutes = new Date().getMinutes()
  const times = time.replace('00', '0').split(' : ')
  if (currHours > Number(times[0])) {
    return false
  }
  if (currHours == Number(times[0]) && currMinutes > Number(times[1])) {
    return false
  }
  return true
}

function showToast() {
  wx.showToast({
    title: '添加成功',
    duration: 2000,
  })
}

function showLoading() {
  wx.showLoading({
    title: '加载中…'
  })
}

function showModal(content, showCancel, callback) {
  wx.showModal({
    title: '提示',
    content: content,
    showCancel: showCancel,
    success: function (res) {
      if (res.confirm && callback) callback()
    }
  })
}

function navigateTo(route) {
  wx.navigateTo({
    url: '../../pages/' + route,
  })
}

function uploadErrorInfo(db, type, err) {
  if (!db || err && err.errMsg == 'requestPayment:fail cancel') {
    return
  }

  db.collection('errorInfo').add({
    data: {
      type: type,
      error: err
    }
  })
}


module.exports = {
  randomInt: randomInt,
  getDateStr: getDateStr,
  randomWord: randomWord,
  showModal: showModal,
  showToast: showToast,
  navigateTo: navigateTo,
  showLoading: showLoading,
  randomBgImage: randomBgImage,
  getCustomTimes: getCustomTimes,
  inDeliveryTime: inDeliveryTime,
  uploadErrorInfo: uploadErrorInfo
}