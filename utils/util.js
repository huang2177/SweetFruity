function randomInt(length) {
  return parseInt(Math.random() * length);
}

function randomWord() {
  var nums = "";
  var chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', ];

  for (var i = 0; i < 18; i++) {
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


module.exports = {
  randomInt: randomInt,
  getDateStr: getDateStr,
  randomWord: randomWord,
}